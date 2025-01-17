import { Figma } from 'figma-api';
import type { FileNodesResponse, Node } from '@figma/rest-api-spec';
import { generateColorPalette } from './color-utils';

interface DesignToken {
  name: string;
  type: 'color' | 'typography' | 'spacing' | 'shadow';
  value: string;
}

interface DesignSystem {
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, string>;
  shadows: Record<string, string>;
}

export class FigmaIntegration {
  private client: Figma;
  private fileId: string;

  constructor(accessToken: string, fileId: string) {
    this.client = new Figma({
      personalAccessToken: accessToken
    });
    this.fileId = fileId;
  }

  async extractDesignTokens(): Promise<DesignSystem> {
    try {
      const file = await this.client.getFile(this.fileId);
      const styleMap = await this.client.getFileStyles(this.fileId);
      
      const designSystem: DesignSystem = {
        colors: {},
        typography: {},
        spacing: {},
        shadows: {}
      };

      // Extract color styles
      Object.values(styleMap).forEach(style => {
        if (style.styleType === 'FILL') {
          const colorValue = this.parseColorValue(style);
          if (colorValue) {
            designSystem.colors[style.name] = colorValue;
          }
        }
      });

      // Extract typography styles
      const typographyNodes = this.findNodesByType(file.document, 'TEXT');
      typographyNodes.forEach(node => {
        if (node.style) {
          const styleKey = `${node.style.fontFamily}-${node.style.fontSize}`;
          designSystem.typography[styleKey] = {
            fontFamily: node.style.fontFamily,
            fontSize: node.style.fontSize,
            fontWeight: node.style.fontWeight,
            lineHeight: node.style.lineHeight,
            letterSpacing: node.style.letterSpacing
          };
        }
      });

      return designSystem;
    } catch (error) {
      console.error('Error extracting design tokens:', error);
      throw error;
    }
  }

  async generateThemeConfig(): Promise<{
    colors: Record<string, string>;
    typography: Record<string, any>;
  }> {
    const designSystem = await this.extractDesignTokens();
    
    // Generate light/dark palette based on primary colors
    const primaryColor = Object.values(designSystem.colors).find(color => 
      color.toLowerCase().includes('primary')
    ) || '#1f2937';

    const lightPalette = generateColorPalette(primaryColor, 'light');
    const darkPalette = generateColorPalette(primaryColor, 'dark');

    return {
      colors: {
        light: lightPalette,
        dark: darkPalette
      },
      typography: designSystem.typography
    };
  }

  private parseColorValue(style: any): string | null {
    try {
      if (style.paints && style.paints[0]) {
        const paint = style.paints[0];
        if (paint.type === 'SOLID') {
          const { r, g, b } = paint.color;
          return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${
            Math.round(g * 255).toString(16).padStart(2, '0')}${
            Math.round(b * 255).toString(16).padStart(2, '0')}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing color value:', error);
      return null;
    }
  }

  private findNodesByType(node: Node, type: string): Node[] {
    const nodes: Node[] = [];
    
    const traverse = (node: Node) => {
      if (node.type === type) {
        nodes.push(node);
      }
      
      if ('children' in node) {
        node.children.forEach(child => traverse(child));
      }
    };
    
    traverse(node);
    return nodes;
  }

  // Helper method to analyze component usage
  async analyzeComponents(): Promise<{
    components: Record<string, number>;
    commonPatterns: string[];
  }> {
    try {
      const file = await this.client.getFile(this.fileId);
      const components: Record<string, number> = {};
      const patterns: Set<string> = new Set();

      const analyzeNode = (node: Node) => {
        if (node.type === 'COMPONENT') {
          components[node.name] = (components[node.name] || 0) + 1;
          
          // Analyze naming patterns
          const pattern = node.name.split('/')[0];
          if (pattern) {
            patterns.add(pattern);
          }
        }

        if ('children' in node) {
          node.children.forEach(analyzeNode);
        }
      };

      analyzeNode(file.document);

      return {
        components,
        commonPatterns: Array.from(patterns)
      };
    } catch (error) {
      console.error('Error analyzing components:', error);
      throw error;
    }
  }
}

// Helper function to apply theme from Figma
export async function applyFigmaTheme(accessToken: string, fileId: string) {
  const figma = new FigmaIntegration(accessToken, fileId);
  const themeConfig = await figma.generateThemeConfig();
  
  // Update theme.json with Figma colors
  const themeUpdate = {
    variant: "professional",
    primary: themeConfig.colors.light.primary,
    appearance: "system",
    radius: 0.5
  };

  return themeUpdate;
}

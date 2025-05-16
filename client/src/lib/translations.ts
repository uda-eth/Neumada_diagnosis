import { useLanguage } from './language-context';
import OpenAI from 'openai';

type TranslationKey = 
  | 'discover'
  | 'connect'
  | 'create'
  | 'make'
  | 'inbox'
  | 'profile'
  | 'settings'
  | 'guide'
  | 'searchEvents'
  | 'allCategories'
  | 'thisWeekend'
  | 'nextWeek'
  | 'buyTickets'
  | 'saveEvent'
  | 'publishEvent'
  | 'processingPurchase'
  | 'redirectingToCheckout'
  | 'eventSaved'
  | 'findInSavedEvents'
  | 'concierge'
  | 'languageSettings'
  | 'selectYourLanguage'
  | 'premiumUpgrade'
  | 'translator'
  | 'logout'
  | 'adminPanel'
  | 'myProfile'
  | 'home'
  | 'pageNotFound'
  | 'filters'
  | 'connections'
  | 'save'
  | 'edit'
  | 'delete'
  | 'yourNetwork'
  | 'incomingRequests'
  | 'location'
  | 'category'
  | 'categoryFiltering'
  | 'locationBasedDiscovery'
  | 'eventManagement'
  | 'navigation'
  | 'welcomeToCommunity'
  | 'profileSetup'
  | 'digitalNomads'
  | 'allLocations'
  | 'selectCity'
  | 'createEvent'
  | 'eventsFound'
  | 'searchByVibe'
  | 'eventsThisMonth'
  | 'free'
  | 'perPerson'
  | 'cities'
  | 'vibe'
  | 'allCities'
  | 'selectVibes'
  | 'findPeopleWithSimilarVibes'
  | 'clearAll'
  | 'searchByName'
  | 'addPhotosFlyer'
  | 'eventTitle'
  | 'fillEventDetails'
  | 'vibesForEvent'
  | 'eventLocation'
  | 'eventDate'
  | 'paid'
  | 'yourStatus'
  | 'eventOptions'
  | 'editEvent'
  | 'deleteEvent'
  | 'interested'
  | 'attending'
  | 'getTickets'
  | 'about'
  | 'eventSchedule'
  | 'attendees'
  | 'more'
  | 'price'
  | 'recommendedForYou'
  | 'trending'
  | 'addItem'
  | 'startTime'
  | 'endTime'
  | 'description'
  | 'addAnotherItem'
  | 'noScheduleItems'
  | 'bestRooftops'
  | 'bestDateSpots'
  | 'bestDayTrips'
  | 'findingLocalInsights'
  | 'askAnythingAbout'
  | 'conciergeGreeting'
  | 'premiumAdPartner'
  | 'letsGetStarted'
  | 'Party & Nightlife'
  | 'Fashion & Style'
  | 'Networking & Business'
  | 'Dining & Drinks'
  | 'Outdoor & Nature'
  | 'Wellness & Fitness'
  | 'Creative & Artsy'
  | 'Single & Social'
  | 'Chill & Recharge'
  | 'Adventure & Exploring'
  | 'Spiritual & Intentional'
  | 'editProfile'
  | 'shareProfile'
  | 'connectProfile'
  | 'viewLocations'
  | 'moodAndVibe'
  | 'shareModalTitle'
  | 'shareModalDescription'
  | 'copy'
  | 'copied'
  | 'email'
  | 'whatsapp'
  | 'sms'
  | 'done'
  | 'yourStatus'
  | 'eventOptions'
  | 'editEvent'
  | 'deleteEvent'
  | 'interested'
  | 'attending'
  | 'free'
  | 'perPerson'
  | 'getTickets'
  | 'about'
  | 'eventSchedule'
  | 'attendees';

const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    discover: 'Discover',
    connect: 'Connect',
    create: 'Create',
    make: 'Make',
    inbox: 'Inbox',
    profile: 'Profile',
    settings: 'Settings',
    guide: 'City Guide',
    searchEvents: 'Search events...',
    allCategories: 'All categories',
    thisWeekend: 'THIS WEEKEND',
    nextWeek: 'NEXT WEEK',
    buyTickets: 'Buy Tickets',
    saveEvent: 'Save Event',
    publishEvent: 'Publish Event',
    processingPurchase: 'Processing Purchase',
    redirectingToCheckout: 'Redirecting to secure checkout...',
    eventSaved: 'Event Saved',
    findInSavedEvents: 'You can find this in your saved events',
    concierge: 'Concierge',
    languageSettings: 'Language Settings',
    selectYourLanguage: 'Select Your Language',
    premiumUpgrade: 'Premium Upgrade',
    translator: 'Translator',
    logout: 'Logout',
    adminPanel: 'Admin Panel',
    myProfile: 'My Profile',
    home: 'Home',
    pageNotFound: 'Page Not Found',
    filters: 'Filters',
    connections: 'Connections',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    yourNetwork: 'Your Network',
    incomingRequests: 'Incoming Requests',
    location: 'Location',
    category: 'Category',
    categoryFiltering: 'Category filtering',
    locationBasedDiscovery: 'Location-based discovery',
    eventManagement: 'Event Management',
    navigation: 'Navigation',
    welcomeToCommunity: 'Welcome to the Community',
    profileSetup: 'Let\'s set up your profile and help you connect with like-minded nomads.',
    digitalNomads: 'digital nomads',
    allLocations: 'All Locations',
    selectCity: 'Select city',
    createEvent: 'Create Event',
    eventsFound: 'events found',
    searchByVibe: 'Search by Vibe',
    eventsThisMonth: 'Events this month',
    cities: 'Cities',
    vibe: 'Vibe',
    allCities: 'All Cities',
    selectVibes: 'Select Vibes',
    findPeopleWithSimilarVibes: 'Find people with similar vibes',
    clearAll: 'Clear all',
    searchByName: 'Search by name...',
    addPhotosFlyer: 'Add photos or flyer for your event',
    eventTitle: 'Event title',
    fillEventDetails: 'Fill in Event Details',
    vibesForEvent: 'Vibes for this Event',
    eventLocation: 'Event Location',
    eventDate: 'Event Date',
    paid: 'Paid',
    addItem: 'Add Item',
    startTime: 'Start Time',
    endTime: 'End Time',
    description: 'Description',
    addAnotherItem: 'Add Another Item',
    noScheduleItems: 'No schedule items added yet. Click "Add Item" to create your event schedule.',
    bestRooftops: 'Best Rooftops',
    bestDateSpots: 'Best Date Spots',
    bestDayTrips: 'Best Day Trips',
    findingLocalInsights: 'Finding local insights...',
    askAnythingAbout: 'Ask anything about',
    conciergeGreeting: "Hi, I'm Maly — like your local friend with great taste. I'll help you know where to go, who to know, and what to do.",
    premiumAdPartner: 'Premium Ad Partner',
    letsGetStarted: "Let's Get Started!",
    'Party & Nightlife': 'Party & Nightlife',
    'Fashion & Style': 'Fashion & Style',
    'Networking & Business': 'Networking & Business',
    'Dining & Drinks': 'Dining & Drinks',
    'Outdoor & Nature': 'Outdoor & Nature',
    'Wellness & Fitness': 'Wellness & Fitness',
    'Creative & Artsy': 'Creative & Artsy',
    'Single & Social': 'Single & Social',
    'Chill & Recharge': 'Chill & Recharge',
    'Adventure & Exploring': 'Adventure & Exploring',
    'Spiritual & Intentional': 'Spiritual & Intentional',
    editProfile: 'Edit Profile',
    shareProfile: 'Share Profile',
    connectProfile: 'Connect',
    viewLocations: 'View Locations',
    moodAndVibe: 'Mood & Vibe',
    shareModalTitle: 'Share',
    shareModalDescription: 'Share this with friends via:',
    copy: 'Copy',
    copied: 'Copied!',
    email: 'Email',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    done: 'Done',
    yourStatus: 'Your Status',
    eventOptions: 'Event Options',
    editEvent: 'Edit Event',
    deleteEvent: 'Delete Event',
    interested: 'Interested',
    attending: 'Attending',
    free: 'Free',
    perPerson: 'per person',
    getTickets: 'Get Tickets',
    about: 'About',
    eventSchedule: 'Event Schedule',
    attendees: 'Attendees',
    more: 'more',
    price: 'Price',
    recommendedForYou: 'Recommended For You',
    trending: 'Trending'
  },
  es: {
    discover: 'Descubrir',
    connect: 'Conectar',
    create: 'Crear',
    make: 'Hacer',
    inbox: 'Mensajes',
    profile: 'Perfil',
    settings: 'Ajustes',
    guide: 'Guía Local',
    searchEvents: 'Buscar eventos...',
    allCategories: 'Todas las categorías',
    thisWeekend: 'ESTE FIN DE SEMANA',
    nextWeek: 'PRÓXIMA SEMANA',
    buyTickets: 'Comprar Entradas',
    saveEvent: 'Guardar Evento',
    publishEvent: 'Publicar Evento',
    processingPurchase: 'Procesando Compra',
    redirectingToCheckout: 'Redirigiendo al pago seguro...',
    eventSaved: 'Evento Guardado',
    findInSavedEvents: 'Puedes encontrarlo en tus eventos guardados',
    concierge: 'Conserje',
    languageSettings: 'Configuración de Idioma',
    selectYourLanguage: 'Selecciona tu Idioma',
    premiumUpgrade: 'Actualización Premium',
    translator: 'Traductor',
    logout: 'Cerrar Sesión',
    adminPanel: 'Panel de Administración',
    myProfile: 'Mi Perfil',
    home: 'Inicio',
    pageNotFound: 'Página No Encontrada',
    filters: 'Filtros',
    connections: 'Conexiones',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    yourNetwork: 'Tu Red',
    incomingRequests: 'Solicitudes Entrantes',
    location: 'Ubicación',
    category: 'Categoría',
    categoryFiltering: 'Filtrado por categoría',
    locationBasedDiscovery: 'Descubrimiento basado en ubicación',
    eventManagement: 'Gestión de Eventos',
    navigation: 'Navegación',
    welcomeToCommunity: 'Bienvenido a la Comunidad',
    profileSetup: 'Configuremos tu perfil y ayudemos a conectarte con nómadas afines.',
    digitalNomads: 'nómadas digitales',
    allLocations: 'Todas las Ubicaciones',
    selectCity: 'Seleccionar ciudad',
    createEvent: 'Crear Evento',
    eventsFound: 'eventos encontrados',
    searchByVibe: 'Buscar por Ambiente',
    eventsThisMonth: 'Eventos este mes',
    cities: 'Ciudades',
    vibe: 'Ambiente',
    allCities: 'Todas las Ciudades',
    selectVibes: 'Seleccionar Ambientes',
    findPeopleWithSimilarVibes: 'Encuentra personas con ambientes similares',
    clearAll: 'Borrar todo',
    searchByName: 'Buscar por nombre...',
    addPhotosFlyer: 'Añadir fotos o folleto para tu evento',
    eventTitle: 'Título del evento',
    fillEventDetails: 'Completar detalles del evento',
    vibesForEvent: 'Ambientes para este evento',
    eventLocation: 'Ubicación del evento',
    eventDate: 'Fecha del evento',
    paid: 'De pago',

    addItem: 'Añadir elemento',
    startTime: 'Hora de inicio',
    endTime: 'Hora de fin',
    description: 'Descripción',
    addAnotherItem: 'Añadir otro elemento',
    noScheduleItems: 'Aún no hay elementos en la agenda. Haz clic en "Añadir elemento" para crear la agenda del evento.',
    bestRooftops: 'Mejores Terrazas',
    bestDateSpots: 'Mejores Lugares para Citas',
    bestDayTrips: 'Mejores Excursiones de un Día',
    findingLocalInsights: 'Buscando información local...',
    askAnythingAbout: 'Pregunta cualquier cosa sobre',
    conciergeGreeting: "Hola, soy Maly — como tu amigo local con buen gusto. Te ayudaré a saber dónde ir, a quién conocer y qué hacer.",
    premiumAdPartner: 'Socio Premium de Publicidad',
    letsGetStarted: "¡Comencemos!",
    'Party & Nightlife': 'Fiesta y Vida Nocturna',
    'Fashion & Style': 'Moda y Estilo',
    'Networking & Business': 'Networking y Negocios',
    'Dining & Drinks': 'Comidas y Bebidas',
    'Outdoor & Nature': 'Aire Libre y Naturaleza',
    'Wellness & Fitness': 'Bienestar y Fitness',
    'Creative & Artsy': 'Creativo y Artístico',
    'Single & Social': 'Solteros y Social',
    'Chill & Recharge': 'Relajación y Recarga',
    'Adventure & Exploring': 'Aventura y Exploración',
    'Spiritual & Intentional': 'Espiritual e Intencional',
    editProfile: 'Editar Perfil',
    shareProfile: 'Compartir Perfil',
    connectProfile: 'Conectar',
    viewLocations: 'Ver Ubicaciones',
    moodAndVibe: 'Estado y Ambiente',
    shareModalTitle: 'Compartir',
    shareModalDescription: 'Compartir con amigos a través de:',
    copy: 'Copiar',
    copied: '¡Copiado!',
    email: 'Correo',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    done: 'Listo',
    yourStatus: 'Tu Estado',
    eventOptions: 'Opciones del Evento',
    editEvent: 'Editar Evento',
    deleteEvent: 'Eliminar Evento',
    interested: 'Interesado',
    attending: 'Asistiendo',
    free: 'Gratis',
    perPerson: 'por persona',
    getTickets: 'Obtener Entradas',
    about: 'Acerca de',
    eventSchedule: 'Programa del Evento',
    attendees: 'Asistentes',
    more: 'más',
    price: 'Precio',
    recommendedForYou: 'Recomendado Para Ti',
    trending: 'Tendencia'
  }
};

// Initialize OpenAI client if API key is available
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '', 
  dangerouslyAllowBrowser: true 
});

// Cache for translations to avoid repeated API calls
const translationCache: Record<string, Record<string, string>> = {
  'en': {},
  'es': {}
};

/**
 * Translates text using OpenAI if available, or returns the original text
 * @param text Text to translate
 * @param targetLanguage Language code to translate to
 * @returns Translated text or original if translation fails
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || text.trim() === '') return text;
  
  // Check cache first
  const cacheKey = `${text}_${targetLanguage}`;
  if (translationCache[targetLanguage]?.[text]) {
    return translationCache[targetLanguage][text];
  }
  
  try {
    // Use OpenAI for translation
    if (openai.apiKey) {
      const prompt = `Translate the following text to ${targetLanguage === 'es' ? 'Spanish' : 'English'}: "${text}"
      Return ONLY the translated text, nothing else.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a professional translator. Provide only the translated text without any additional information." },
          { role: "user", content: prompt }
        ],
      });
      
      const translatedText = response.choices[0].message.content?.trim() || text;
      
      // Cache the result
      if (!translationCache[targetLanguage]) translationCache[targetLanguage] = {};
      translationCache[targetLanguage][text] = translatedText;
      
      return translatedText;
    }
  } catch (error) {
    console.error('Translation error:', error);
  }
  
  // Fallback: return original text if translation fails
  return text;
}

/**
 * Translates a user tag or category
 * @param tag The tag to translate
 * @param language Target language ('en' or 'es')
 */
export async function translateTag(tag: string, language: string): Promise<string> {
  // If tag is already in translations, use that directly
  const translatedTag = translations[language][tag as TranslationKey];
  if (translatedTag) return translatedTag;
  
  // Otherwise use the translation API
  return await translateText(tag, language);
}

/**
 * Translates user profile information
 * @param profile User profile data
 * @param language Target language ('en' or 'es')
 */
export async function translateUserProfile(
  profile: {
    fullName?: string | null;
    username: string;
    location?: string | null;
    tags?: string[];
  },
  language: string
): Promise<{
  fullName?: string | null;
  username: string;
  location?: string | null;
  tags?: string[];
}> {
  if (language === 'en') return profile; // No need to translate if target is English
  
  const result = { ...profile };
  
  // Translate name
  if (profile.fullName) {
    result.fullName = await translateText(profile.fullName, language);
  }
  
  // Translate location
  if (profile.location) {
    result.location = await translateText(profile.location, language);
  }
  
  // Translate tags
  if (profile.tags && profile.tags.length > 0) {
    const translatedTags = await Promise.all(
      profile.tags.map(tag => translateTag(tag, language))
    );
    result.tags = translatedTags;
  }
  
  return result;
}

/**
 * Translates event information
 * @param event Event data
 * @param language Target language ('en' or 'es')
 */
export async function translateEvent<T extends {
  title: string;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  tags?: string[] | null;
  [key: string]: any;
}>(
  event: T,
  language: string
): Promise<T> {
  if (language === 'en') return event; // No need to translate if target is English
  
  const result = { ...event };
  
  // Translate title
  if (event.title) {
    result.title = await translateText(event.title, language);
  }
  
  // Translate description
  if (event.description) {
    result.description = await translateText(event.description, language);
  }
  
  // Translate location
  if (event.location) {
    result.location = await translateText(event.location, language);
  }
  
  // Translate category
  if (event.category) {
    // If category is in predefined translations, use that
    const translatedCategory = translations[language][event.category as TranslationKey];
    result.category = translatedCategory || await translateText(event.category, language);
  }
  
  // Translate tags
  if (event.tags && event.tags.length > 0) {
    const translatedTags = await Promise.all(
      event.tags.map(tag => translateTag(tag, language))
    );
    result.tags = translatedTags;
  }
  
  return result as T;
}

export function useTranslation() {
  const { language, setLanguage } = useLanguage();
  
  const t = (key: TranslationKey | string) => {
    if (typeof key === 'string' && !translations[language][key as TranslationKey]) {
      // Return the key itself if it's not found in translations
      return key;
    }
    return translations[language][key as TranslationKey] || translations['en'][key as TranslationKey];
  };

  return { t, setLanguage, language, translateText, translateUserProfile, translateTag, translateEvent };
}
import { useLanguage } from './language-context';

type TranslationKey = 
  | 'discover'
  | 'connect'
  | 'create'
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
  | 'publishEvent';

const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    discover: 'Discover',
    connect: 'Connect',
    create: 'Create',
    inbox: 'Inbox',
    profile: 'Profile',
    settings: 'Settings',
    guide: 'City Guide',
    searchEvents: 'Search events...',
    allCategories: 'All categories',
    thisWeekend: 'THIS WEEKEND',
    nextWeek: 'NEXT WEEK',
    buyTickets: 'Buy',
    saveEvent: 'Save Event',
    publishEvent: 'Publish Event'
  },
  es: {
    discover: 'Descubrir',
    connect: 'Conectar',
    create: 'Crear',
    inbox: 'Mensajes',
    profile: 'Perfil',
    settings: 'Ajustes',
    guide: 'Guía Local',
    searchEvents: 'Buscar eventos...',
    allCategories: 'Todas las categorías',
    thisWeekend: 'ESTE FIN DE SEMANA',
    nextWeek: 'PRÓXIMA SEMANA',
    buyTickets: 'Comprar',
    saveEvent: 'Guardar',
    publishEvent: 'Publicar Evento'
  }
};

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: TranslationKey) => {
    return translations[language][key] || translations['en'][key];
  };

  return { t };
}

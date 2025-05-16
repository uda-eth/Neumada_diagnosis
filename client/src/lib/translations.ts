import { useLanguage } from './language-context';

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
  | 'Spiritual & Intentional';

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
    free: 'Free',
    perPerson: 'per person',
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
    'Spiritual & Intentional': 'Spiritual & Intentional'
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
    free: 'Gratis',
    perPerson: 'por persona',
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
    'Spiritual & Intentional': 'Espiritual e Intencional'
  }
};

export function useTranslation() {
  const { language, setLanguage } = useLanguage();
  
  const t = (key: TranslationKey | string) => {
    if (typeof key === 'string' && !translations[language][key as TranslationKey]) {
      // Return the key itself if it's not found in translations
      return key;
    }
    return translations[language][key as TranslationKey] || translations['en'][key as TranslationKey];
  };

  return { t, setLanguage, language };
}
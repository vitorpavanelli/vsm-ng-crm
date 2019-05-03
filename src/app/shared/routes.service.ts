export class RoutesService {
  static _ROUTES = {
    login: { resource: 'login' },
    dashboard: { resource: 'dashboard' },
    crm: {
      resource: 'crm',
      cliente: {
        resource: 'cliente',
        regrapontuacao: { resource: 'regrapontuacao' }
      }
    },
    admin: {
      resource: 'admin',
      access: { resource: 'access' },
      menu: { resource: 'resource' }
    }
  };
}

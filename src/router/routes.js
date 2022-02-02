const routes = [
  {
    name: 'solver',
    path: '/:gameId?',
    component: () => import('pages/Index.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;

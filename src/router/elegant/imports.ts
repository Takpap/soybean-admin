/* eslint-disable */
/* prettier-ignore */
// Generated by elegant-router
// Read more: https://github.com/soybeanjs/elegant-router

import type { RouteComponent } from "vue-router";
import type { LastLevelRouteKey, RouteLayout } from "@elegant-router/types";

import BaseLayout from "@/layouts/base-layout/index.vue";
import BlankLayout from "@/layouts/blank-layout/index.vue";

export const layouts: Record<RouteLayout, RouteComponent | (() => Promise<RouteComponent>)> = {
  base: BaseLayout,
  blank: BlankLayout,
};

export const views: Record<LastLevelRouteKey, RouteComponent | (() => Promise<RouteComponent>)> = {
  403: () => import("@/views/_builtin/403/index.vue"),
  404: () => import("@/views/_builtin/404/index.vue"),
  500: () => import("@/views/_builtin/500/index.vue"),
  login: () => import("@/views/_builtin/login/index.vue"),
  about: () => import("@/views/about/index.vue"),
  advertiser: () => import("@/views/advertiser/index.vue"),
  "function_multi-tab": () => import("@/views/function/multi-tab/index.vue"),
  function_tab: () => import("@/views/function/tab/index.vue"),
  home: () => import("@/views/home/index.vue"),
  manage_config: () => import("@/views/manage/config/index.vue"),
  manage_menu: () => import("@/views/manage/menu/index.vue"),
  manage_relation: () => import("@/views/manage/relation/index.vue"),
  manage_role: () => import("@/views/manage/role/index.vue"),
  "manage_user-detail": () => import("@/views/manage/user-detail/[id].vue"),
  manage_user: () => import("@/views/manage/user/index.vue"),
  "multi-menu_first_child": () => import("@/views/multi-menu/first_child/index.vue"),
  "multi-menu_second_child_home": () => import("@/views/multi-menu/second_child_home/index.vue"),
  novel: () => import("@/views/novel/index.vue"),
  theater: () => import("@/views/theater/index.vue"),
  trend: () => import("@/views/trend/index.vue"),
  "user-center": () => import("@/views/user-center/index.vue"),
};

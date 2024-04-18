import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

export function createAdvertiserRelation(params?: Api.SystemManage.RelationSearchParams) {
  return request({
    url: `/advertiser/mark`,
    method: 'post',
    data: params
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request({
    url: '/user/roles',
    method: 'get'
  });
}

export function fetchGetAllMembers() {
  return request({
    url: '/user/members',
    method: 'get'
  });
}

/** get user list */
export function fetchGetTheaterList(params?: Api.SystemManage.AdvertiserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/advertiser/theater',
    method: 'get',
    params
  });
}

/** get user list */
export function fetchGetAdvertiserList(params?: Api.SystemManage.AdvertiserSearchParams) {
  localStorage.setItem('start_end', `${params.start_date}_${params.end_date}`);
  return request<Api.SystemManage.UserList>({
    url: '/advertiser',
    method: 'get',
    params
  });
}

/** get user list */
export function fetchAdvertiserList() {
  return request<Api.SystemManage.UserList>({
    url: '/user/alias-map',
    method: 'get'
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/user',
    method: 'get',
    params
  });
}

/** get Relation list */
export function fetchGetRelationList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/relation',
    method: 'get',
    params
  });
}

/** get Relation list */
export function updateRelation(params?: Api.SystemManage.RelationSearchParams) {
  return request({
    url: `/relation/${params?.id}`,
    method: 'patch',
    data: params
  });
}

/** get Relation list */
export function createRelation(params?: Api.SystemManage.RelationSearchParams) {
  return request({
    url: `/relation`,
    method: 'post',
    data: params
  });
}

/** get user list */
export function deleteRelation(id: string) {
  return request({
    url: `/relation/${id}`,
    method: 'delete'
  });
}

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.Menu[]>({
    url: '/systemManage/getMenuList',
    method: 'get'
  });
}

/** get user list */
export function updateUser(params?: Api.SystemManage.UserSearchParams) {
  return request({
    url: `/user/${params?.id}`,
    method: 'patch',
    data: params
  });
}

/** get user list */
export function createUser(params?: Api.SystemManage.UserSearchParams) {
  return request({
    url: `/user`,
    method: 'post',
    data: params
  });
}

/** get user list */
export function deleteUser(id: string) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  });
}

/** get user list */
export function changePwd(params: any) {
  return request({
    url: `/user/change-pwd`,
    method: 'patch',
    data: params
  });
}

export function fetchRatio() {
  return request({
    url: '/ratio',
    method: 'get'
  });
}

export function updateRatio(params: any) {
  return request({
    url: '/ratio',
    method: 'put',
    params
  });
}

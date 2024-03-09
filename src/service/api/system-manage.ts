import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/user/roles',
    method: 'get'
  });
}

/** get user list */
export function fetchGetAdvertiserList(params?: Api.SystemManage.AdvertiserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/advertiser',
    method: 'get',
    params
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

export function fetchRatio() {
  return request({
    url: '/ratio',
    method: 'get',
  });
}

export function updateRatio(params: any) {
  return request({
    url: '/ratio',
    method: 'put',
    params
  });
}

import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { flatMap, switchMap, map } from 'rxjs/operators';

import { ModelService } from 'app/model.service';
import { User as UserModel } from 'app/models/user';
import { User } from 'app/actions/entities/users';
import { AddUserTag, RemoveUserTag } from 'app/actions/entities';
import { Notify } from 'app/actions/app-notify';

import {
  UserEditProfile,
  UserEditProfileSuccess,
  CreateUserTag,
  CreateUserTagSuccess,
  CreateTagAndUserTag,
  UpdateUserTag,
  UpdateUserTagSuccess,
  DeleteUserTag,
  DeleteUserTagSuccess,
  UserTagNotAdded,
  UserEditActionTypes
} from 'app/actions/user-edit'

@Injectable()
export class UserEditEffects {
  constructor(private actions$: Actions,
              private modelService: ModelService) {}

  @Effect()
  userEditProfile$ = this.actions$.pipe(
    ofType(UserEditActionTypes.USER_EDIT_PROFILE),
    map((action: UserEditProfile) => action.payload),
    flatMap(profile => this.modelService.updateUser('', profile)),
    switchMap((user: UserModel) => [
      new UserEditProfileSuccess(user),
      new User(user),
      new Notify({ type: 'info', message: 'your profile was updated' })
    ])
  )

  @Effect()
  createUserTag$ = this.actions$.pipe(
    ofType(UserEditActionTypes.CREATE_USER_TAG),
    map((action: CreateUserTag) => action.payload),
    flatMap(({ id }) => this.modelService.addTagToUser({ tagId: id })),
    switchMap(({ user, tag, userTag }) => [
      new CreateUserTagSuccess(userTag),
      new AddUserTag({ user, tag, userTag }),
      new Notify({ type: 'info', message: `${userTag.id} created`})
    ])
  )

  @Effect()
  createTagAndUserTag$ = this.actions$.pipe(
    ofType(UserEditActionTypes.CREATE_TAG_AND_USER_TAG),
    map((action: CreateTagAndUserTag) => action.payload),
    flatMap(({ id }) => this.modelService.createTag({ id })),
    switchMap((tag) => [
      new CreateUserTag(tag)
    ])
  )

  @Effect()
  updateUserTag$ = this.actions$.pipe(
    ofType(UserEditActionTypes.UPDATE_USER_TAG),
    map((action: UpdateUserTag) => action.payload),
    flatMap((payload) => Promise.all([this.modelService.updateUserTag(payload), Promise.resolve(payload)])),
    switchMap(([{ user, tag, userTag }, payload]) => [
      new UpdateUserTagSuccess(userTag),
      new AddUserTag({ user, tag, userTag }),
      ...(payload.story !== undefined) ? [new Notify({ type: 'info', message: 'your story was updated' })] : [],
      ...(payload.relevance !== undefined) ? [new UserTagNotAdded(userTag)] : []
    ])
  )

  @Effect()
  deleteUserTag$ = this.actions$.pipe(
    ofType(UserEditActionTypes.DELETE_USER_TAG),
    map((action: DeleteUserTag) => action.payload),
    flatMap(async (userTag) => { await this.modelService.removeUserTag(userTag); return userTag }),
    switchMap((userTag) => {
      return [
        new DeleteUserTagSuccess(userTag),
        new RemoveUserTag(userTag),
        new UserTagNotAdded(userTag)
      ]
    })
  )
}

/*
import { Router, ActivatedRoute } from '@angular/router';
import { Effect, Actions, ofType } from '@ngrx/effects';

import { map, tap, flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { Authenticate } from 'app/models/auth';
import { AuthService } from 'app/services/auth';
import { ModelService } from 'app/model.service';

import {
  Login,
  LoginSuccess,
  Logout,
  GetSelfDataSuccess,
  AuthActionTypes
} from 'app/actions/auth';

@Injectable()
export class AuthEffects {

  constructor(private actions$: Actions,
              private authService: AuthService,
              private model: ModelService,
              private route: ActivatedRoute,
              private router: Router) {}

  @Effect()
  login$ = this.actions$.pipe(
    ofType(AuthActionTypes.LOGIN),
    map((action: Login) => action.payload),
    flatMap((auth: Authenticate) =>
      this.authService.login(auth)
        .pipe(
          map(({ user, verified, token }) => new LoginSuccess({ user, verified, token }))
        )
    )
  )

  // get user's data after login
  @Effect()
  loginSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.LOGIN_SUCCESS),
    map((action: LoginSuccess) => action.payload),
    flatMap(({ user: { username } }) =>
      Observable.fromPromise(this.model.readUser(username))
        .pipe(
          map((user) => new GetSelfDataSuccess({ user }))
        )
    )
  );

  // after getting user data, redirect
  @Effect({ dispatch: false })
  getSelfDataSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.GET_SELF_DATA_SUCCESS),
    tap(() => {
      this.router.navigate([this.route.snapshot.queryParams.redirect || '/'])
    })
  )

  @Effect({ dispatch: false})
  logout$ = this.actions$.pipe(
    ofType(AuthActionTypes.LOGOUT),
    map((action: Logout) => action.payload),
    map((payload) => {
      this.authService.clearPersistentLogin();
      if (payload && payload.redirect)
        this.router.navigate(['/'])
    })
  )
}
*/

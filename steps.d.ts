/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps/steps_file.js');
type EndpointHelper = import('./helpers/EndpointHelper.js');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any }
  interface Methods extends EndpointHelper, Playwright {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}

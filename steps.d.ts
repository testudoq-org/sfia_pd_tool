/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps/steps_file.js');
type EndpointHelper = import('./helpers/EndpointHelper.js');
type FileHelper = import('./helpers/FileHelper.js');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any }
  interface Methods extends EndpointHelper, FileHelper, Playwright {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}

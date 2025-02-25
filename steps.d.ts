/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps/steps_file.js');
type EndpointHelper = import('./test/helpers/EndpointHelper.js');
type FileHelper = import('./test/helpers/FileHelper.js');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any }
  interface Methods extends EndpointHelper, Playwright, FileHelper {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}

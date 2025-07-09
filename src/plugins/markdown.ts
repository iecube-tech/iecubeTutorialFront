
import { MdEditor,  MdPreview, MdCatalog } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';


export const setupMakeDown = (app: any) => {
  app.component('MdEditor', MdEditor)
  app.component('MdPreview', MdPreview)
  app.component('MdCatalog', MdCatalog)
}
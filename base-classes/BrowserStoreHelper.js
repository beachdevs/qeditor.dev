Base.BrowserStoreHelper = class BrowserStoreHelper {
  static save() {
    const currname = $('u-box-workflows').value;
    if(currname) {
      // Don't save empty workflows
      if(!editor.export()?.nodes) return;

      storage.set('Workflows', currname, editor.export());
    }
    storage.set('Current', 'Workflow', editor.export());
  }
  static onDraggedElementEnd() {
    BrowserStoreHelper.save();
  }
  static onNodeAdded() {
    BrowserStoreHelper.save();
  }
  static onNodeNameChanged() {
    BrowserStoreHelper.save();
  }
  static onNodeRemoved() {
    BrowserStoreHelper.save();
  }
  static onUboxCreateNewEntry(data) {
    editor.clear();
    editor.addNode();
  }
  static onBoxDelete(data) {
    BrowserStoreHelper.save();
  }
  static onZoomChanged(data) {
    BrowserStoreHelper.save();
  }
  static onHTMLEditorChanged(data) {
    BrowserStoreHelper.save();
  }
}

export default Base.BrowserStoreHelper;
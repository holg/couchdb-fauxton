// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.
define([
  "app",
  "api",
  "addons/databases/base",
  "addons/indexes/views",
  "addons/documents/views",
  "addons/indexes/resources",
  "addons/indexes/routes-core"
],

function (app, FauxtonAPI, Databases, Views, Documents, Resources, RouteCore) {

  var ViewIndexes = RouteCore.extend({
    routes: {
      "database/:database/_design/:ddoc/_view/:view": {
        route: "viewFn",
        roles: ['_admin']
      },
      "database/:database/new_view": "newViewEditor",
      "database/:database/new_view/:designDoc": "newViewEditor"
    },

    newViewEditor: function (database, designDoc) {
      var params = app.getParams();
      this.rightheader && this.rightheader.remove();

      this.setView("#right-content", new Views.PreviewScreen({}));

      this.viewEditor = this.setView("#left-content", new Views.ViewEditor({
        model: this.data.database,
        currentddoc: designDoc ? "_design/"+designDoc : "",
        ddocs: this.data.designDocs,
        params: params,
        database: this.data.database,
        newView: true
      }));

      this.leftheader = this.setView("#breadcrumbs", new Views.LeftHeader({
        title:"Create a View Index",
        database: this.data.database
      }));

    },

    viewFn: function (databaseName, ddoc, view) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          docParams = params.docParams,
          decodeDdoc = decodeURIComponent(ddoc);
          view = view.replace(/\?.*$/,'');

      this.leftheader = this.setView("#breadcrumbs", new Views.LeftHeader({
        title: view,
        database: this.data.database
      }));

      this.rightheader = this.setView("#api-bar", new Views.RightHeader({
        database: this.data.database
      }));

      this.data.indexedDocs = new Resources.IndexCollection(null, {
        database: this.data.database,
        design: decodeDdoc,
        view: view,
        params: docParams,
        paging: {
          pageSize: this.getDocPerPageLimit(urlParams, parseInt(docParams.limit, 10))
        }
      });

      this.viewEditor = this.setView("#left-content", new Views.ViewEditor({
        model: this.data.database,
        ddocs: this.data.designDocs,
        viewName: view,
        params: urlParams,
        newView: false,
        database: this.data.database,
        ddocInfo: this.ddocInfo(decodeDdoc, this.data.designDocs, view)
      }));

      this.documentsView = this.createViewDocumentsView({
        designDoc: decodeDdoc,
        docParams: docParams,
        urlParams: urlParams,
        database: this.data.database,
        indexedDocs: this.data.indexedDocs,
        designDocs: this.data.designDocs,
        view: view
      });

      this.apiUrl = [this.data.indexedDocs.urlRef("apiurl", urlParams), "docs"];
    }
  });

  return ViewIndexes;
});

// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns HTML that contains content from the example database. */
@WebServlet("/example")
public class exampledbServlet extends HttpServlet {

  DatabaseClient dbClient;

  public void init() {
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of("play-user-data-beetle", "test-instance" , "example-db");
    this.dbClient = spanner.getDatabaseClient(db);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/JSON;");

    List<String> listDatabases = new ArrayList<String>();

    try (ResultSet resultSet =
        dbClient
            .singleUse() // Execute a single read or query against Cloud Spanner.
            .executeQuery(Statement.of("SELECT option_name FROM information_schema.database_options WHERE catalog_name = '' and schema_name = ''"))) {
       while(resultSet.next()){
           /*response
            .getWriter()
            .println(
                String.format(
                    "<p>%s</p>",
                    resultSet.isNull(0) ? "" : resultSet.getString(0)));*/
            listDatabases.add(String.format(resultSet.getString(0)));// the names of the databases aren't stored under a column so they are not easily accessible by index
            
        }

        //Converting resultList into JSON data
        String json = convertToJsonUsingGson(listDatabases);
        response.getWriter().println(json);
       }
  }

  private String convertToJsonUsingGson(List<String> listDatabases) {
    Gson gson = new Gson();
    String json = gson.toJson(listDatabases);
    return json;
  }
    
}
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

import com.google.common.collect.Multimap;
import com.google.common.collect.ArrayListMultimap;
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

/** Servlet that returns an HTML list of all the columns of based on the selected tables. */
@WebServlet("/columns-from-tables")
public class ColumnsFromTablesServlet extends HttpServlet {
    //TODO: get rid of constant instance and instead import constants from file
    DatabaseClient dbClient;

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
      response.setContentType("application/JSON;"); 
      Constants constant = new Constants();

      Multimap<String, Object> data = ArrayListMultimap.create();

      //Parsing the URL for the query parameters
      String[] listOfTables = request.getParameterValues(constant.TABLE_SELECT_PARAM);
      String database = request.getParameter(constant.DATABASE_PARAM);

      this.dbClient = DatabaseConnector.getInstance().getDbClient(database);

      String query = "";
      String selectedTables = "";

      if (listOfTables.length == 1) {
        query = query + constant.GET_COLUMNS_FROM_TABLES + "\'" + listOfTables[0] + "\'" + constant.GROUP_BY_TABLE_NAMES;
      } else {
        query = query + constant.GET_COLUMNS_FROM_TABLES;
        for (int i = 0; i < listOfTables.length; i++) {
          if (i != listOfTables.length-1) {
            selectedTables = "\'" + listOfTables[i] + "\'";
            query = query + selectedTables + ", ";
          } else {
            selectedTables = "\'" + listOfTables[i] + "\'";
            query = query + selectedTables;
          }
        }
        query = query + constant.GROUP_BY_TABLE_NAMES;   
      }

      try (ResultSet resultSet =
        dbClient
        .singleUse() // Execute a single read or query against Cloud Spanner.
        .executeQuery(Statement.of(query))) {
        while (resultSet.next()) {
          data.put(resultSet.getString(0), resultSet.getStringList(1));
        }
      }

      //Converting resultList into JSON data
      String json = convertToJsonUsingGson(data);
      response.getWriter().println(json);
    }

    private String convertToJsonUsingGson(Multimap<String, Object> data) {
      Gson gson = new Gson();
      String json = gson.toJson(data.asMap());
      return json;
    }
}
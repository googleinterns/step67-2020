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
import static com.google.sps.servlets.Constants.DATABASE_PARAM;
import static com.google.sps.servlets.Constants.GET_COLUMNS_FROM_TABLES;
import static com.google.sps.servlets.Constants.GET_PRIMARY_KEYS_FROM_TABLES;
import static com.google.sps.servlets.Constants.GROUP_BY_PRIMARY_KEYS;
import static com.google.sps.servlets.Constants.GROUP_BY_TABLE_NAMES;
import static com.google.sps.servlets.Constants.TABLE_SELECT_PARAM;

/** Servlet that returns an HTML list of all the columns of based on the selected tables. */
@WebServlet("/columns-from-tables")
public class ColumnsFromTablesServlet extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
      response.setContentType("application/JSON;"); 

      Multimap<String, List> data = ArrayListMultimap.create();

      //Parsing the URL for the query parameters
      String[] listOfTables = request.getParameterValues(TABLE_SELECT_PARAM);
      String database = request.getParameter(DATABASE_PARAM);

      DatabaseClient dbClient = DatabaseConnector.getInstance().getDbClient(database);

      String query = "";
      String selectedTables = "";

      //TODO: use StringBuilder rather than string concatenation

      //query = query + GET_COLUMNS_FROM_TABLES;
      query = query + GET_PRIMARY_KEYS_FROM_TABLES;
      for (int i = 0; i < listOfTables.length; i++) {
        //TODO: check if backslash is actually needed here
        selectedTables = "\'" + listOfTables[i] + "\'";
        query = query + selectedTables;
        if (i != listOfTables.length-1) {
          query = query + ", ";
        } 
      }
      query = query + GROUP_BY_TABLE_NAMES + GROUP_BY_PRIMARY_KEYS;   // Queries list of columns and primary keys of the selected tables
      //String query = QueryFactory.getInstance().buildColumnsQuery(listOfTables);

      try (ResultSet resultSet =
          dbClient
          .singleUse() 
          .executeQuery(Statement.of(query))) {
        while (resultSet.next()) {
          data.put(resultSet.getString(0), resultSet.getStringList(2));
                    //[table_name]        [primary_keys]
          data.put(resultSet.getString(0), resultSet.getStringList(1));
                    //[table_name]        [columns_list]
        }
      }
      //Converting resultList into JSON data
      String json = convertToJsonUsingGson(data);
      response.getWriter().println(json);
    }

    private String convertToJsonUsingGson(Multimap<String, List> data) {
      Gson gson = new Gson();
      String json = gson.toJson(data.asMap());
      return json;
    }
}
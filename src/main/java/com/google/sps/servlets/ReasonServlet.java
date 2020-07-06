package com.google.sps.servlets;

import java.io.IOException;
import java.util.Arrays;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that sends reason for use to /text. */
@WebServlet("/text")
public final class ReasonServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Get the input from the form.
    String text = getParameter(request, "reason", "");
    System.out.println(text);
    String[] words = text.split("\\s*,\\s*");
    response.setContentType("text/html;");
    response.getWriter().println(Arrays.toString(words));
  }

  /**
   * @return the request parameter, or the default value if the parameter
   *         was not specified by the client
   */
  private String getParameter(HttpServletRequest request, String name, String defaultValue) {
    String value = request.getParameter(name);
    if (value == null) {
      return defaultValue;
    }
    return value;
  }
}

    // boolean upperCase = Boolean.parseBoolean(getParameter(request, "upper-case", "false"));
    // for now just test getParam(request, database selection);
    
    // here is my idea
    /* We use a switch statement for whatever table has been selected
    to determine which State to be in for querying the data.*/

    /* We can use this same principle for selecting the database,
     after a database is chosen we use a switch statement to see the tables.
     Maybe, I just need to figure out how to not hardcode the tables */

    // Break the text into individual words.
    //get list of play user data team and check if the current user is one of them
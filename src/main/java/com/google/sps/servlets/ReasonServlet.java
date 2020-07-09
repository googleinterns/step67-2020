package com.google.sps.servlets;

import java.io.IOException;
import java.util.Arrays;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that sends reason for use to /reason. (will change to write to database)*/
@WebServlet("/reason")
public final class ReasonServlet extends HttpServlet {
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Get the input from the form.
    long timestamp = System.currentTimeMillis();
    String text = getParameter(request, "reason", "");
    String[] words = text.split("\\s*,\\s*");
    response.setContentType("text/html;");
    response.getWriter().println(Arrays.toString(words));
  }

  private String getParameter(HttpServletRequest request, String name, String defaultValue) {
    String value = request.getParameter(name);
    if (value == null) {
      return defaultValue;
    }
    return value;
  } 
}
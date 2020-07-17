package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
  public static String currentUser;
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/JSON");

    UserService userService = UserServiceFactory.getUserService();
    List<String> userEmail = new ArrayList<String>();

    if (!userService.isUserLoggedIn()) {
      String urlToRedirectToAfterUserLogsIn = "/splash.html";
      String loginUrl = userService.createLoginURL(urlToRedirectToAfterUserLogsIn);
      userEmail.add("Stranger");
      //  response.sendRedirect("https://accounts.google.com/signin/v2/identifier?");
    } else{
        String currentUserEmail = userService.getCurrentUser().getEmail();
        userEmail.add(currentUserEmail);
    }
    String email = convertToJsonUsingGson(userEmail);
    response.getWriter().println(email);
  }
  
  private String convertToJsonUsingGson(List<String> email) {
    Gson gson = new Gson();
    String json = gson.toJson(email);
    return json;
  }
} 
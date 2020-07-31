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
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
  Set<String> usersWithAccess = new HashSet<String>();
  public void init(){
      usersWithAccess.add("test@example.com");
      usersWithAccess.add("jiaxinz@google.com");
      usersWithAccess.add("gagomez@google.com");
      usersWithAccess.add("hilakey@google.com");
      usersWithAccess.add("sasymer@google.com");
      usersWithAccess.add("williamdc@google.com");
  }
  public static String currentUser;
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.setContentType("text/html");

    UserService userService = UserServiceFactory.getUserService();
    String userEmail = "";

    if (!userService.isUserLoggedIn()) {
      String loginUrl = userService.createLoginURL("/index.html");
      userEmail = "Stranger";
      String mail = convertToJsonUsingGson(userEmail);
      response.getWriter().println(mail);
      return;
    } else {
        String currentUserEmail = userService.getCurrentUser().getEmail();
        userEmail = currentUserEmail;
        currentUser = currentUserEmail;
        if (!usersWithAccess.contains(currentUserEmail)){
            userEmail="deny";
        }
    }
    
    String email = convertToJsonUsingGson(userEmail);
    response.getWriter().println(email);
  }
  
  private String convertToJsonUsingGson(String email) {
    Gson gson = new Gson();
    String json = gson.toJson(email);
    return json;
  }
  
  public static String getCurrentUser(){
    return currentUser;
  }
} 
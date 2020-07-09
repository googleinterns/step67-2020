package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
  public static String currentUser;
  public static String currentUserEmail;
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html");

    UserService userService = UserServiceFactory.getUserService();

    if (!userService.isUserLoggedIn()) {
      String urlToRedirectToAfterUserLogsIn = "/login";
      String loginUrl = userService.createLoginURL(urlToRedirectToAfterUserLogsIn);
      response.getWriter().println("<p>Hello stranger.</p>");
      response.getWriter().println("<p>Login <a href=\"" + loginUrl + "\">here</a>.</p>");
      //FIXME: always redirects  --  response.sendRedirect("https://accounts.google.com/signin/v2/identifier?");
      return;
    }
    else{
        String urlToRedirectToAfterUserLogsOut = "https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin";
        String logoutUrl = userService.createLogoutURL(urlToRedirectToAfterUserLogsOut);
        String userEmail = userService.getCurrentUser().getEmail();

        if (userEmail == "test@example.com"){
            response.getWriter().println("<p> You need to login!</p>");
        }
        String homePage = "/index.html";
        response.getWriter().println("<h1> You are Logged in as " + userEmail + "!<h1>");
        response.getWriter().println("<a href=\"" +homePage+ "\"><button>Home</button/></a>");
        response.getWriter().println("<a href=\"" + logoutUrl + "\"><button>Logout</button/></a>");
    }
  }
} 
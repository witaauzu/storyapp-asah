import HomePage from '../pages/home/home-page.js';
import AddStoryPage from '../pages/add-story/add-story-page.js';
import DetailPage from '../pages/detail/detail-page.js';
import LoginPage from '../pages/auth/login/login-page.js';
import RegisterPage from '../pages/auth/register/register-page.js';
import BookmarkPage from '../pages/bookmark/bookmark-page.js';

const routes = {
  '/': new HomePage(),
  '/add-story': new AddStoryPage(),
  '/detail/:id': new DetailPage(),
  '/bookmark': new BookmarkPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;

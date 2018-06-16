using Microsoft.AspNetCore.Mvc;

namespace Tetris.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            ViewBag.Title = "Main Page";
            return View();
        }
    }
}
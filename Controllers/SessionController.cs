using System;
using Microsoft.AspNetCore.Mvc;

namespace Tetris
{
    public class SessionController : Controller
    {
        public Guid Create()
        {
            Session session = new Session()
            {
                StartTime = DateTime.Now
            };

            return session.Id;
        }
    }
}
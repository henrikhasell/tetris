using Microsoft.EntityFrameworkCore;

namespace Tetris.Services
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext(DbContextOptions<DatabaseContext> options) :
            base(options)
        {
        }

        public DbSet<Session> Sessions { set; get; }
    }
}
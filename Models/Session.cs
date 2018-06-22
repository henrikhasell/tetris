using System;

namespace Tetris
{
    public class Session
    {
        public Guid Id {set;get;}

        public DateTime StartTime { set; get; }

        public DateTime EndTime { set; get; }

        public int Score { set; get; }
    }
}
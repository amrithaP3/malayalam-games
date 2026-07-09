import { useNavigate } from 'react-router-dom';
import studentsImg from '../assets/homePage/Learn_Malayalam.png';
import imgAlphabet from '../assets/homePage/Malayalam_Alphabet.png';
import imgGames    from '../assets/homePage/Learning_Games.png';
import imgStories  from '../assets/homePage/Malayalam_Stories.png';
import imgTest     from '../assets/homePage/Test_Your_Malayalam.png';

const SECTIONS = [
  { num: '01', title: 'Malayalam Alphabet',  img: imgAlphabet, color: '#E8737A', path: null,     iconClass: 'alphabet' },
  { num: '02', title: 'Learning Games',      img: imgGames,    color: '#5B9BD5', path: '/games', iconClass: 'games'    },
  { num: '03', title: 'Malayalam Stories',   img: imgStories,  color: '#F0A868', path: null,     iconClass: 'stories'  },
  { num: '04', title: 'Test your Malayalam', img: imgTest,     color: '#F5C842', path: null,     iconClass: 'test'     },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="landing">
      <div className="students-card">
        <div className="students-holes">
          {Array.from({ length: 7 }).map((_, i) => <span key={i} className="students-hole" />)}
        </div>
        <div className="students-content">
          <h1 className="students-title">Learn Malayalam</h1>
          <p className="students-subtitle">Learn the Malayalam language through English.</p>
          <img className="students-illustration" src={studentsImg} alt="" />
        </div>
      </div>

      <div className="sections-grid">
        {SECTIONS.map(s => (
          <button
            key={s.num}
            className={`section-card${!s.path ? ' section-card--soon' : ''}`}
            style={{ '--card-color': s.color }}
            onClick={() => s.path && navigate(s.path)}
            disabled={!s.path}
          >
            <span className="section-num">{s.num}</span>
            <span className="section-title">{s.title}</span>
            <img className={`section-icon section-icon--${s.iconClass}`} src={s.img} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

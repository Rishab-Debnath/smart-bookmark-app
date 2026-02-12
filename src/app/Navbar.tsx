import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <span>🔖 Smart Bookmark</span>
        </Link>
      </div>
      <ul className={styles.navLinks}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="#features">Features</Link></li>
        <li><Link href="#about">About</Link></li>
      </ul>
    </nav>
  );
}

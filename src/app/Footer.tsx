import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <span>© {new Date().getFullYear()} Smart Bookmark App. All rights reserved.</span>
      </div>
      <div className={styles.links}>
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="#privacy">Privacy</a>
      </div>
    </footer>
  );
}

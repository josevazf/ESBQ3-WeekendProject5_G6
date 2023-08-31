import styles from "./footer.module.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.icons_container}>
        <div>
          <a
            href="https://github.com/josevazf/ESBQ3-WeekendProject5_G6"
            target={"_blank"}
          >
            Leave a star on Github
          </a>
        </div>
      </div>
    </div>
  );
}

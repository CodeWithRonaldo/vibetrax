import styles from "./Button.module.css";

const Button = ({ btnClass = "primary", text, onClick, disabled, icon }) => {
  return (
    <button className={styles[btnClass]} onClick={onClick} disabled={disabled}>
      {text} {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  );
};

export default Button;

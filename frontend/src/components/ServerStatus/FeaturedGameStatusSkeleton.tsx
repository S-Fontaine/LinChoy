"use client";
import styles from "./FeaturedGameStatusSkeleton.module.css";

export function FeaturedGameStatusSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonHeaderText}>
            <div
              className={styles.skeletonLine}
              style={{ width: "80px", height: "12px" }}
            />
            <div
              className={styles.skeletonLine}
              style={{ width: "220px", height: "24px" }}
            />
          </div>
          <div
            className={styles.skeletonLine}
            style={{ width: "24px", height: "24px", borderRadius: "50%" }}
          />
        </div>

        <div className={styles.skeletonStatusRow}>
          <div
            className={styles.skeletonLine}
            style={{ width: "100px", height: "16px" }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: "90px", height: "16px" }}
          />
        </div>

        <div
          className={styles.skeletonLine}
          style={{ width: "100%", height: "14px" }}
        />
        <div
          className={styles.skeletonLine}
          style={{ width: "70%", height: "14px" }}
        />

        <div className={styles.skeletonPlayersSection}>
          <div
            className={styles.skeletonLine}
            style={{ width: "120px", height: "12px" }}
          />
          <div className={styles.skeletonChips}>
            <div className={styles.skeletonChip} />
            <div className={styles.skeletonChip} />
            <div className={styles.skeletonChip} />
          </div>
        </div>
      </div>
    </div>
  );
}
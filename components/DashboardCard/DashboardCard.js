import React from 'react';
import styles from './DashboardCard.module.scss'
import Image from 'next/image';

export const DashboardCard = ({ cardName, total, image, colorClass }) => {
  const card_name = cardName || 'Projects';
  const card_total = total || '0';
  const card_image = image || '/images/project-card-icon.svg';
  const image_shadow = colorClass || '';

  return (<>
    <div className={styles.card}>
      <div className={styles.project}>
        <Image src={card_image} alt="project-image" width={50} height={50} className={`${image_shadow}`} />
        <span className={styles.name}>{card_name}</span>
      </div>
      <div>
        <span className={styles.amount}>{card_total}</span>
      </div>
    </div>
  </>)
}

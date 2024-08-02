import React from 'react'
import styles from './AdminCard.module.scss'
import Image from 'next/image'
import { useRouter } from 'next/router'
export default function AdminCard({ cssclass, icon, name, amount, url }) {

  const router = useRouter();

  return (<>
    <div className={styles.card} onClick={() => router.push(url)}>
      <div className={styles[cssclass]}>
        <Image src={`/images/${icon}.svg`} alt={`${icon}-image`} width={50} height={50} />
        <span className={styles.name}>{name}</span>
      </div>
      <div>
        <span className={styles.amount}>{amount}</span>
      </div>
    </div>
  </>)
}

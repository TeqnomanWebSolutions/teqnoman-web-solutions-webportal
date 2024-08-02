import Image from "next/image";
import React from "react";
import styles from './SearchBox.module.scss';

const SearchBox = ({ text, onSearch }) => {

    const handleSearch = (e) => {
        if (onSearch) {
            onSearch(e);
        }
    }
    const placeHolder = text || 'Search anything here';

    return (<>
        <div className={styles.search}>
            <Image src="/images/search-icon.svg" alt="search-icon" height={14} width={14} />
            <input type="text" className={styles.searchTerm} placeholder={placeHolder} onChange={(e) => handleSearch(e)} />
        </div>
    </>)
}

export default SearchBox;

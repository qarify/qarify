import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { translate } from '@docusaurus/Translate';
import parse from 'html-react-parser';

import styles from './index.module.css';

type FeatureItem = {
  title: string;
  img: any;
  description: string;
};

function Feature({ title, img, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureColumn)}>
      <div className={styles.featureCard}>
        <div className="text--center">
          <img src={img} className={styles.featureImage} alt={title} />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3" className={styles.featureTitle}>
            {title}
          </Heading>
          <p>{parse(description)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="QArify Documentation">
      {/* Hero Section */}
      <header className={clsx('hero', styles.heroBanner)}>
        <div className="container">
          <Heading as="h2" className={clsx('hero__title', styles.heroTitle)}>
            {parse(
              translate({
                id: 'hero.title',
                message: 'Happy Path만 🔴기록 하세요.',
                description: 'Hero Top Phrase in 랜딩페이지',
              }),
            )}
          </Heading>
          <Heading as="h1" className={clsx('hero__title_middle', styles.heroTitle)}>
            {parse(
              translate({
                id: 'hero.title_middle',
                message: '나머지는 ✨ <strong>AI가 QArify</strong>합니다.',
                description: 'Hero Middle Phrase in 랜딩페이지',
              }),
            )}
          </Heading>
          <p className={clsx('hero__subtitle', styles.heroSubtitle)}>{parse(siteConfig.tagline)}</p>

          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started/your-first-test">
              {translate({
                message: 'QArify 튜토리얼 - 5min ⏱️',
                description: 'QArify 튜토리얼 링크 in 랜딩페이지',
              })}
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className={clsx('text--center', styles.sectionTitle)}>
              <Heading as="h2">
                {translate({
                  id: 'features.main-title',
                  message: '테스트에 드는 시간은 줄이고, 개발에 더 많은 시간을 투자하세요.',
                })}
              </Heading>
            </div>
            <div className="row">
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

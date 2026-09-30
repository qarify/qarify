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

const FeatureListIcons = [
  require('@site/static/img/feature-1.png').default,
  require('@site/static/img/feature-2.png').default,
  require('@site/static/img/feature-3.png').default,
];

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
              <Feature
                title={translate({ id: 'feature.title-1', message: '코딩 없이 손쉬운 시나리오 녹화' })}
                description={translate({
                  id: 'feature.description-1',
                  message: `🪄 <strong>복잡한 테스트 스크립트는 잊으세요.</strong><br/>웹에서 행동을 수행하기만 하면, QArify가 몇 분 만에 안정적이고 재사용 가능한 테스트 케이스로 자동 변환합니다.`,
                })}
                img={FeatureListIcons[0]}
              />
              <Feature
                title={translate({ id: 'feature.title-2', message: 'AI 기반 자동 테스트 확장' })}
                description={translate({
                  id: 'feature.description-2',
                  message: `✨ 바로 이 순간, <strong>마법</strong>이 일어납니다.<br/>AI가 당신의 '성공 경로' 하나를 분석하여, 미처 생각지 못했을 <strong>수십 개</strong>의 중요한 엣지 케이스와 실패 테스트를 생성합니다.`,
                })}
                img={FeatureListIcons[1]}
              />
              <Feature
                title={translate({ id: 'feature.title-3', message: '궁극의 확장성과 커스터마이제이션' })}
                description={translate({
                  id: 'feature.description-3',
                  message: `🧩 QArify를 당신의 과제에 맞춰보세요.<br/>플러그인을 통해 <code>CI/CD 파이프라인</code>과 연동하고, <code>MCP 서버</code>로 데이터를 모킹하며 테스트 환경을 <strong>완벽하게 제어</strong>하세요.`,
                })}
                img={FeatureListIcons[2]}
              />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

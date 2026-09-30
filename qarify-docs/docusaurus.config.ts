import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

export default async function createConfigAsync(): Promise<Config> {
  return {
    title: 'QArify',
    tagline: 'Love coding, but hate writing tests?<br/>Record a path, and let our AI QArify the rest.',
    favicon: 'img/favicon.ico',

    // Future flags, see https://docusaurus.io/docs/api/qarify-config#future
    future: {
      v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: 'https://qarify.github.io',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/qy-docs/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'qarify', // Usually your GitHub org/user name.
    projectName: 'qy-docs', // Usually your repo name.

    onBrokenLinks: 'throw',
    markdown: {
      hooks: {
        onBrokenMarkdownLinks: 'warn',
      },
    },

    i18n: {
      defaultLocale: 'ko',
      locales: ['ko', 'en'],
    },

    presets: [
      [
        'classic',
        {
          docs: {
            sidebarPath: './sidebars.ts',
          },
          blog: {
            showReadingTime: true,
            feedOptions: {
              type: ['rss', 'atom'],
              xslt: true,
            },
            // Useful options to enforce blogging best practices
            onInlineTags: 'warn',
            onInlineAuthors: 'warn',
            onUntruncatedBlogPosts: 'warn',
          },
          theme: {
            customCss: './src/css/style.css',
          },
        } satisfies Preset.Options,
      ],
    ],

    themeConfig: {
      image: 'img/qarify-social-card.png',
      //
      // Top Nav
      //
      navbar: {
        title: 'QArify',
        logo: {
          alt: 'QArify Logo',
          src: 'img/logo-icon.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docSidebar',
            position: 'left',
            label: 'Docs',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/qarify/qarify-monorepo',
            label: 'GitHub',
            position: 'right',
          },
          // Locale Menu
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      //
      // Footer
      //
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/introduction',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/qarify',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/qarify',
              },
              {
                label: 'X',
                href: 'https://x.com/qarify',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/qarify/qarify-monorepo',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} QArify, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    } satisfies Preset.ThemeConfig,
  };
}

import React from 'react'
import Hero from './_components/Hero'
import StatisticsSection from './_components/StatisticsSection'
import HowWeHelpSection from './_components/HowWeHelpSection'
import ImpactMetricsSection from './_components/ImpactMetricsSection'
import FeaturedStoriesSection from './_components/FeaturedStoriesSection'
import AutoScrollGallery from './_components/AutoScrollGallery'
import ConsortiumSection from './_components/ConsortiumSection'
import ContactSection from '../../../components/layout/ContactSection'

const Home = () => {
  return (
    <>
      <Hero />
      <StatisticsSection />
      <HowWeHelpSection />
      <ConsortiumSection />
      <ImpactMetricsSection />
      <FeaturedStoriesSection />
      <AutoScrollGallery />
      <ContactSection />
    </>
  )
}

export default Home

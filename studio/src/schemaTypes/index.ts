import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {infoPage} from './documents/infoPage'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {homePage} from './singletons/homePage'
import {slotsPageSettings} from './documents/slotsPageSettings'
import {lotoPageSettings} from './singletons/lotoPageSettings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import {provider} from './documents/provider'
import {game} from './documents/game'
import {casino} from './documents/casino'
import {casinoReview} from './documents/casinoReview'
import {topListObject} from './objects/topListObject'
import {authorComment} from './objects/authorComment'
import {faqItem} from './objects/faqItem'
import {faqSection} from './objects/faqSection'
import {featuredCasino} from './objects/featuredCasino'
import {featuredGamesGrid} from './objects/featuredGamesGrid'
import {featuredGame} from './objects/featuredGame'
import {bonusCalculator} from './objects/bonusCalculator'
import {reviewMethodology} from './objects/reviewMethodology'
import {beginnersGuide} from './objects/beginnersGuide'
import {simpleButton} from './objects/simpleButton'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  homePage,
  slotsPageSettings,
  lotoPageSettings,
  // Documents
  page,
  post,
  infoPage,
  person,
  provider,
  game,
  casino,
  casinoReview,
  // Objects
  blockContent,
  infoSection,
  callToAction,
  simpleButton,
  link,
  topListObject,
  authorComment,
  faqItem,
  faqSection,
  featuredCasino,
  featuredGame,
  featuredGamesGrid,
  bonusCalculator,
  reviewMethodology,
  beginnersGuide,
]

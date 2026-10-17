const STOPWORDS = [
  // Generic English Stopwords (~119 words)
  // Articles & Determiners
  'a', 'an', 'the', 'this', 'that', 'these', 'those',

  // Pronouns
  'i', 'me', 'my', 'mine', 'myself',
  'you', 'your', 'yours', 'yourself',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself',
  'we', 'us', 'our', 'ours', 'ourselves',
  'they', 'them', 'their', 'theirs', 'themselves',

  // Prepositions
  'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'of', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'over', 'against', 'among', 'within', 'without',
  'throughout', 'towards', 'upon', 'off', 'out', 'around', 'across',

  // Conjunctions
  'and', 'but', 'or', 'nor', 'so', 'yet', 'for',
  'as', 'if', 'when', 'where', 'while', 'though', 'although',
  'because', 'since', 'unless', 'until', 'whether',

  // Auxiliary Verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'done',
  'will', 'would', 'shall', 'should',
  'may', 'might', 'must', 'can', 'could',

  // Question Words
  'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',

  // Quantifiers
  'all', 'some', 'any', 'few', 'many', 'much', 'more', 'most',
  'each', 'every', 'either', 'neither', 'both', 'several',

  // Adverbs
  'very', 'too', 'quite', 'just', 'only', 'even', 'also',
  'still', 'already', 'never', 'ever', 'always', 'often', 'usually',
  'sometimes', 'rarely', 'seldom', 'hardly', 'nearly', 'almost',
  'really', 'actually', 'probably', 'maybe', 'perhaps',
  'here', 'there', 'everywhere', 'anywhere', 'somewhere', 'nowhere',
  'now', 'then', 'soon', 'later', 'today', 'yesterday', 'tomorrow',

  // Common Verbs
  'get', 'gets', 'getting', 'got', 'gotten',
  'go', 'goes', 'going', 'went', 'gone',
  'come', 'comes', 'coming', 'came',
  'see', 'sees', 'seeing', 'saw', 'seen',
  'know', 'knows', 'knowing', 'knew', 'known',
  'think', 'thinks', 'thinking', 'thought',
  'say', 'says', 'saying', 'said',
  'tell', 'tells', 'telling', 'told',

  // Others
  'not', 'no', 'yes', 'ok', 'okay',
  'than', 'then', 'such', 'like', 'same', 'own', 'other',

  
  // Request/Action Words
  'need', 'needs', 'needed', 'needing',
  'want', 'wants', 'wanted', 'wanting',
  'looking', 'look', 'looks', 'looked',
  'seeking', 'seek', 'seeks', 'sought',
  'require', 'requires', 'required', 'requiring',
  'help', 'helps', 'helped', 'helping',
  'provide', 'provides', 'provided', 'providing',
  'find', 'finds', 'finding', 'found',
  'give', 'gives', 'giving', 'gave', 'given',
  'take', 'takes', 'taking', 'took', 'taken',
  'make', 'makes', 'making', 'made',
  'use', 'uses', 'using', 'used',
  'work', 'works', 'working', 'worked',

  // Generic Solution Words
  'solution', 'solutions',
  'system', 'systems',
  'product', 'products',
  'device', 'devices',
  'machine', 'machines',
  'equipment',
  'tool', 'tools',
  'technology', 'technologies',
  'method', 'methods',
  'way', 'ways',
  'means',
  'thing', 'things',
  'item', 'items',

  // Quality/Opinion Words
  'good', 'better', 'best',
  'bad', 'worse', 'worst',
  'great', 'greater', 'greatest',
  'excellent', 'perfect',
  'quality', 'qualities',
  'effective', 'efficiency', 'efficient',
  'productive', 'productivity',
  'reliable', 'reliability',
  'durable', 'durability',
  'affordable', 'cheap', 'expensive',
  'high', 'higher', 'highest',
  'low', 'lower', 'lowest',
  'new', 'newer', 'newest', 'latest',
  'old', 'older', 'oldest',

  // Generic Descriptors
  'something', 'anything', 'everything', 'nothing',
  'someone', 'anyone', 'everyone',
  'type', 'types',
  'kind', 'kinds',
  'sort', 'sorts',
  'one', 'ones',
  'part', 'parts',
  'side', 'sides',

  // Polite/Filler Words
  'please', 'thanks', 'thank', 'sorry', 'excuse',
  'sir', 'madam', 'hello', 'hi', 'dear',

  // Time/Frequency Words
  'day', 'days', 'daily',
  'week', 'weeks', 'weekly',
  'month', 'months', 'monthly',
  'year', 'years', 'yearly', 'annual',
  'time', 'times',
  'hour', 'hours',
  'minute', 'minutes',
  'season', 'seasons', 'seasonal',

  // Size/Amount Words
  'big', 'bigger', 'biggest', 'large', 'larger', 'largest',
  'small', 'smaller', 'smallest', 'little',
  'long', 'longer', 'longest', 'short', 'shorter', 'shortest',
  'wide', 'wider', 'widest', 'narrow',
  'deep', 'deeper', 'deepest', 'shallow',
  'heavy', 'heavier', 'heaviest', 'light', 'lighter', 'lightest',

  // Location/Direction Words (Generic)
  'place', 'places',
  'area', 'areas',
  'location', 'locations',
  'near', 'nearby', 'far', 'away',
  'left', 'right', 'front', 'back', 'side',
  'top', 'bottom', 'middle', 'center',
  'inside', 'outside',

  // Demonstrative/Intensifiers
  'such', 'so', 'too', 'enough',
  'much', 'many', 'little', 'few',
  'more', 'most', 'less', 'least',

  // Miscellaneous Common Words
  'etc', 'etcetera',
  'example', 'examples',
  'case', 'cases',
  'issue', 'issues',
  'problem', 'problems',
  'question', 'questions',
  'answer', 'answers',
  'information', 'info',
  'detail', 'details',
  'fact', 'facts',
  'reason', 'reasons',
  'purpose', 'purposes'
];

module.exports = { STOPWORDS };

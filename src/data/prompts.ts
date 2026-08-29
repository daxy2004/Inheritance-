import { StoryPrompt, Language, Theme } from '../types';

export const PROMPTS_BY_LANGUAGE: Record<Language, StoryPrompt[]> = {
  en: [
    {
      id: 'p1',
      category: 'Childhood',
      prompt: 'What is your earliest memory from childhood, and what did your neighborhood look like?',
      sparkTip: 'Think about the streets, the sounds, the friends you played with after school.',
    },
    {
      id: 'p2',
      category: 'Childhood',
      prompt: 'What was your favorite holiday ritual or gift as a young child?',
      sparkTip: 'Think about December mornings, festive songs, or handmade presents.',
    },
    {
      id: 'p3',
      category: 'Career',
      prompt: 'What was your very first job, and what did you buy with your first wages?',
      sparkTip: 'Think about the smells, the bosses, and the feeling of earning your own money.',
    },
    {
      id: 'p4',
      category: 'Career',
      prompt: 'What was a major invention or change during your lifetime that surprised you the most?',
      sparkTip: 'Think about cars, televisions, space landings, phones, or home appliances.',
    },
    {
      id: 'p5',
      category: 'Family',
      prompt: 'Tell me about the day you met your spouse — what were your first impressions?',
      sparkTip: 'Where were you? What made you smile? What were you wearing?',
    },
    {
      id: 'p6',
      category: 'Family',
      prompt: 'What is a vivid memory from when your children were young?',
      sparkTip: 'Think about a funny, surprising, or tender moment that still makes you smile.',
    },
    {
      id: 'p7',
      category: 'Recipes',
      prompt: 'Is there a family recipe with a story behind it that we must never forget?',
      sparkTip: 'Describe who made it best and the smells that filled the house.',
    },
    {
      id: 'p8',
      category: 'Values',
      prompt: 'What is the most important lesson you have learned about marriage and lasting friendships?',
      sparkTip: 'Speak from the heart about relationships, hard times, or staying true to yourself.',
    },
    {
      id: 'p9',
      category: 'Advice',
      prompt: 'What is the single most important piece of advice you would pass down to future great-grandchildren?',
      sparkTip: 'Imagine you are writing a letter they will read in fifty years.',
    },
    {
      id: 'p10',
      category: 'Advice',
      prompt: 'What do you know about how our ancestors came to this country, or your earliest family home?',
      sparkTip: 'Recall any stories passed down by your parents or grandparents.',
    },
  ],

  hi: [
    {
      id: 'p_hi_1',
      category: 'Childhood',
      prompt: 'बचपन की सबसे पुरानी याद क्या है, और उस समय आपका मोहल्ला और खेल कैसे होते थे?',
      sparkTip: 'गलियों के खेल, बारिश के दिन और दोस्तों के साथ की गई शरारतों को याद करें।',
    },
    {
      id: 'p_hi_2',
      category: 'Family',
      prompt: 'दादाजी/पति से पहली मुलाकात का किस्सा सुनाइए — पहली नज़र में क्या ख़ास लगा था?',
      sparkTip: 'शादी के दिन का माहौल, मौसम और कोई मज़ेदार घटना याद करें।',
    },
    {
      id: 'p_hi_3',
      category: 'Recipes',
      prompt: 'खानदान का ऐसा कौन सा पारंपरिक व्यंजन या मिठाई है जिसका स्वाद और कहानी कभी भूलनी नहीं चाहिए?',
      sparkTip: 'त्योहारों पर रसोई में उठती खुशबू और नानी/दादी के खास मसालों का राज़ बताएं।',
    },
    {
      id: 'p_hi_4',
      category: 'Career',
      prompt: 'आपकी पहली नौकरी या पहला काम क्या था, और पहली कमाई से आपने क्या खरीदा था?',
      sparkTip: 'पहली तनख्वाह हाथ में आने की खुशी और माँ-बाप को दिए तोहफे को याद करें।',
    },
    {
      id: 'p_hi_5',
      category: 'Values',
      prompt: 'रिश्तों को उम्र भर निभाए रखने के लिए सबसे बड़ा सबक या संस्कार आपने क्या सीखा?',
      sparkTip: 'सहनशीलता, क्षमा और परिवार को एक सूत्र में पिरोए रखने की बात साझा करें।',
    },
    {
      id: 'p_hi_6',
      category: 'Advice',
      prompt: 'आने वाली पीढ़ियों और पड़पोतों को आप जीवन की कौन सी सबसे बड़ी सीख देना चाहेंगे?',
      sparkTip: 'मुसीबत के समय हिम्मत न हारने और हमेशा सच के साथ खड़े रहने की सलाह।',
    },
  ],

  kn: [
    {
      id: 'p_kn_1',
      category: 'Childhood',
      prompt: 'ನಿಮ್ಮ ಬಾಲ್ಯದ ಅತ್ಯಂತ ಹಳೆಯ ನೆನಪು ಯಾವುದು, ಅಂದಿನ ಊರು ಮತ್ತು ಗೆಳೆಯರು ಹೇಗಿದ್ದರು?',
      sparkTip: 'ಶಾಲೆಯ ದಿನಗಳು, ಮಳೆಗಾಲದ ಆಟಗಳು ಮತ್ತು ಅಜ್ಜಿ ಮನೆಯ ನೆನಪುಗಳನ್ನು ಮೆಲುಕು ಹಾಕಿ.',
    },
    {
      id: 'p_kn_2',
      category: 'Family',
      prompt: 'ಅಜ್ಜ/ಜೊತೆಗಾರರನ್ನು ಮೊದಲ ಬಾರಿಗೆ ಭೇಟಿಯಾದ ಕ್ಷಣ ಹೇಗಿತ್ತು? ಮದುವೆಯ ದಿನದ ನೆನಪುಗಳೇನು?',
      sparkTip: 'ಮದುವೆಯ ಸಂಪ್ರದಾಯ, ಮೃಷ್ಟಾನ್ನ ಭೋಜನ ಮತ್ತು ಆ ದಿನದ ನಗುವಿನ ಪ್ರಸಂಗಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.',
    },
    {
      id: 'p_kn_3',
      category: 'Recipes',
      prompt: 'ಕುಟುಂಬದ ಯಾವ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಯ ರುಚಿ ಮತ್ತು ರಹಸ್ಯವನ್ನು ನಾವು ಎಂದಿಗೂ ಮರೆಯಬಾರದು?',
      sparkTip: 'ಹಬ್ಬದ ದಿನಗಳಲ್ಲಿ ಮನೆಯಲ್ಲಿ ಬರುತ್ತಿದ್ದ ಘಮಘಮಿಸುವ ಸುವಾಸನೆ ಮತ್ತು ರಹಸ್ಯ ಮಸಾಲೆಯ ಬಗ್ಗೆ ಹೇಳಿ.',
    },
    {
      id: 'p_kn_4',
      category: 'Career',
      prompt: 'ನಿಮ್ಮ ಮೊದಲ ಉದ್ಯೋಗ ಅಥವಾ ದುಡಿಮೆ ಯಾವುದು? ಮೊದಲ ಸಂಬಳದಲ್ಲಿ ನೀವು ಏನು ಮಾಡಿದಿರಿ?',
      sparkTip: 'ಮೊದಲ ಗಳಿಕೆಯ ಅನುಭವ ಮತ್ತು ಕುಟುಂಬಕ್ಕೆ ನೀಡಿದ ಪ್ರೀತಿಯ ಕಾಣಿಕೆಯನ್ನು ನೆನಪಿಸಿಕೊಳ್ಳಿ.',
    },
    {
      id: 'p_kn_5',
      category: 'Values',
      prompt: 'ಜೀವನದಲ್ಲಿ ಸದಾ ನೆಮ್ಮದಿಯಿಂದ ಇರಲು ಮತ್ತು ಕಷ್ಟಗಳನ್ನು ಎದುರಿಸಲು ನೀವು ಕಲಿತ ಪಾಠವೇನು?',
      sparkTip: 'ತಾಳ್ಮೆ, ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ಹಿರಿಯರ ಆಶೀರ್ವಾದದ ಮಹತ್ವದ ಬಗ್ಗೆ ಮಾತನಾಡಿ.',
    },
    {
      id: 'p_kn_6',
      category: 'Advice',
      prompt: 'ಮುಂದಿನ ಪೀಳಿಗೆಯ ಮೊಮ್ಮಕ್ಕಳಿಗೆ ನೀವು ನೀಡಲು ಬಯಸುವ ಅತ್ಯಮೂಲ್ಯ ಕಿವಿಮಾತು ಯಾವುದು?',
      sparkTip: 'ಸಂಬಂಧಗಳನ್ನು ಪ್ರೀತಿಸಿ, ಸಂಸ್ಕೃತಿಯನ್ನು ಉಳಿಸಿ ಬೆಳೆಸುವ ಬಗ್ಗೆ ಸಂದೇಶ ನೀಡಿ.',
    },
  ],

  ta: [
    {
      id: 'p_ta_1',
      category: 'Childhood',
      prompt: 'உங்கள் பால்ய காலத்தின் மறக்க முடியாத நினைவு எது? அன்றைய ஊரும் நண்பர்களும் எப்படி இருந்தார்கள்?',
      sparkTip: 'பள்ளி நாட்கள், தெரு விளையாட்டுக்கள் மற்றும் விடுமுறை கொண்டாட்டங்களை நினையுங்கள்.',
    },
    {
      id: 'p_ta_2',
      category: 'Family',
      prompt: 'தாத்தாவை/துணையை முதன்முதலில் சந்தித்த தருணமும் திருமண நாள் நினைவுகளும் எப்படி இருந்தன?',
      sparkTip: 'திருமண மேடை, உறவினர்களின் மகிழ்ச்சி மற்றும் சுவாரஸ்யமான தருணங்களைப் பகிருங்கள்.',
    },
    {
      id: 'p_ta_3',
      category: 'Recipes',
      prompt: 'நம் குடும்பத்தின் எந்த பாரம்பரிய சமையல் குறிப்பையும் சுவையையும் நாம் எப்போதும் மறக்கக் கூடாது?',
      sparkTip: 'பண்டிகை காலங்களில் வீட்டில் மணக்கும் சமையல் மணம் மற்றும் கைமண ரகசியத்தைக் கூறுங்கள்.',
    },
    {
      id: 'p_ta_4',
      category: 'Career',
      prompt: 'உங்கள் முதல் வேலை என்ன? முதல் சம்பளத்தில் நீங்கள் என்ன செய்தீர்கள்?',
      sparkTip: 'சுயமரியாதையுடன் உழைத்த அந்த முதல் அனுபவத்தையும் தாய் தந்தைக்குச் செய்ததையும் பகிருங்கள்.',
    },
    {
      id: 'p_ta_5',
      category: 'Values',
      prompt: 'வாழ்க்கைப் பயணத்தில் சவால்களை வெல்ல நீங்கள் கற்றுக் கொண்ட மிக முக்கியமான தர்மம் எது?',
      sparkTip: 'பொறுமை, உண்மை மற்றும் குடும்ப ஒற்றுமை பற்றிய உங்கள் அனுபவத்தைப் பகிருங்கள்.',
    },
    {
      id: 'p_ta_6',
      category: 'Advice',
      prompt: 'எதிர்காலப் பேரக்குழந்தைகளுக்கு நீங்கள் வழங்கும் வாழ்நாள் அறிவுரை என்ன?',
      sparkTip: 'நேர்மையாகவும் அன்பாகவும் வாழ்வதற்கான உங்கள் இதயப்பூர்வமான வார்த்தைகள்.',
    },
  ],
};

export const STORY_PROMPTS = PROMPTS_BY_LANGUAGE.en;

# RAG retrieval değerlendirmesi

Veri: 8 metin, 45 soru (33 pozitif, 12 negatif). Retrieval: top-4, kosinüs benzerliği.

## Parça boyutu karşılaştırması (pozitif sorular)

| Parça (maks/örtüşme) | Parça sayısı | Hit@1 | Hit@3 | Hit@4 | MRR | Doğru metin @1 |
|---|---|---|---|---|---|---|
| 300/50 (n=33) | 28 | 97% (32/33) | 100% (33/33) | 100% (33/33) | 0.985 | 100% (33/33) |
| 600/100 (n=33) | 17 | 97% (32/33) | 100% (33/33) | 100% (33/33) | 0.980 | 97% (32/33) |
| 1000/150 (n=33) | 9 | 94% (31/33) | 100% (33/33) | 100% (33/33) | 0.965 | 97% (32/33) |

## Dile göre (600/100)

| Soru dili | Parça sayısı | Hit@1 | Hit@3 | Hit@4 | MRR | Doğru metin @1 |
|---|---|---|---|---|---|---|
| tr (n=17) | - | 100% (17/17) | 100% (17/17) | 100% (17/17) | 1.000 | 100% (17/17) |
| en (n=16) | - | 94% (15/16) | 100% (16/16) | 100% (16/16) | 0.958 | 94% (15/16) |

## Eşik taraması (en yüksek benzerlik, 600/100)

Pozitif en yüksek benzerlik: 0.628 – 0.859  
Negatif en yüksek benzerlik: 0.577 – 0.629

Pozitif korunur = en iyi parça eşiği geçiyor ve doğru metne ait. Negatif elenir = hiçbir parça eşiği geçmiyor.

| Eşik | Pozitif korunur | Negatif elenir | Dengeli doğruluk |
|---|---|---|---|
| 0.50 | 97% (32/33) | 0% (0/12) | 0.485 |
| 0.51 | 97% (32/33) | 0% (0/12) | 0.485 |
| 0.52 | 97% (32/33) | 0% (0/12) | 0.485 |
| 0.53 | 97% (32/33) | 0% (0/12) | 0.485 |
| 0.54 | 97% (32/33) | 0% (0/12) | 0.485 |
| 0.55 | 97% (32/33) | 0% (0/12) | 0.485 |
| 0.56 | 97% (32/33) | 0% (0/12) | 0.485 |
| 0.57 | 97% (32/33) | 0% (0/12) | 0.485 |
| 0.58 | 97% (32/33) | 17% (2/12) | 0.568 |
| 0.59 | 97% (32/33) | 33% (4/12) | 0.652 |
| 0.60 | 97% (32/33) | 50% (6/12) | 0.735 |
| 0.61 | 97% (32/33) | 67% (8/12) | 0.818 |
| 0.62 (şu anki) | 97% (32/33) | 75% (9/12) | 0.860 |
| 0.63 | 94% (31/33) | 100% (12/12) | 0.970 |
| 0.64 | 94% (31/33) | 100% (12/12) | 0.970 |
| 0.65 | 94% (31/33) | 100% (12/12) | 0.970 |
| 0.66 | 94% (31/33) | 100% (12/12) | 0.970 |
| 0.67 | 94% (31/33) | 100% (12/12) | 0.970 |
| 0.68 | 91% (30/33) | 100% (12/12) | 0.955 |
| 0.69 | 91% (30/33) | 100% (12/12) | 0.955 |
| 0.70 | 91% (30/33) | 100% (12/12) | 0.955 |
| 0.71 | 88% (29/33) | 100% (12/12) | 0.939 |
| 0.72 | 88% (29/33) | 100% (12/12) | 0.939 |
| 0.73 | 85% (28/33) | 100% (12/12) | 0.924 |
| 0.74 | 79% (26/33) | 100% (12/12) | 0.894 |
| 0.75 | 70% (23/33) | 100% (12/12) | 0.848 |

En iyi dengeli doğruluk: 0.970, eşik 0.63

### Eşiğe yakın sorular (en yüksek benzerlik 0.60 – 0.66)

| Soru | Tür | En yüksek benzerlik |
|---|---|---|
| Bugün kendimi motivasyonsuz hissediyorum, ne yapmalıyım? | negatif | 0.604 |
| Can you give me some tips for the IELTS speaking exam? | negatif | 0.607 |
| 'Make' ile 'do' arasındaki fark ne? | negatif | 0.613 |
| Bana İngilizce bir tekerleme öğret | negatif | 0.623 |
| How do I use 'since' and 'for'? | negatif | 0.624 |
| Peri bacaları nedir? | pozitif | 0.628 |
| What is the difference between 'will' and 'going to'? | negatif | 0.629 |
| What does reluctant mean in the text? | pozitif | 0.655 |

## İlk sırada doğru parça gelmeyen sorular (600/100)

| Soru | Beklenen metin | İlgili parçanın sırası | 1. sıradaki metin (benzerlik) |
|---|---|---|---|
| What does reluctant mean in the text? | Unit 4: A Year in Barcelona | 3 | Unit 3: Learning to Cook (0.655) |

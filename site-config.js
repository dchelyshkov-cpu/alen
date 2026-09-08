/* ALENINDAHOUSE+ canonical content map — prototype only. */
window.ALENINDAHOUSE_CONFIG = {
  version: '3.0',
  phone: {display:"+7 (965) 329-10-40", href:"tel:+79653291040", mobileLabel:"Позвонить"},
  messengers: {telegram:"#", whatsapp:"#", max:"#"},
  typographyCheckpoint: {variant:"VISUAL-TEST-MANROPE-INTER", display:"Manrope", body:"Inter", heroTitle:"single-size-across-lines", carouselNavigation:"glyph-arrows-over-image"},
  sections: [
    {id:'hero', number:'00', name:'HERO'},
    {id:'approach-section', number:'01', name:'ПОДХОД', subtitle:'ИНЖЕНЕРНЫЙ ПОДХОД'},
    {id:'process-section', number:'02', name:'ПРОЦЕСС', subtitle:'ОТ ПЕРВОГО РАЗГОВОРА ДО КЛЮЧЕЙ'},
    {id:'knowledge-section', number:'03', name:'БАЗА ЗНАНИЙ', subtitle:'ВОПРОСЫ СЕБЕ И ПОДРЯДЧИКУ'},
    {id:'calculation-section', number:'04', name:'ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ', subtitle:'ОДНА МИНУТА ВАШЕГО ВРЕМЕНИ ДО ПЕРВОЙ ВСТРЕЧИ'},
    {id:'cases-section', number:'05', name:'КЕЙСЫ', subtitle:'РЕАЛЬНЫЕ ПРОЕКТЫ И ЦИФРЫ'},
    {id:'quality-section', number:'06', name:'КОНТРОЛЬ / КАЧЕСТВО', subtitle:'КАК КАЧЕСТВО ПРОВЕРЯЕТСЯ'},
    {id:'responsibility-section', number:'07', name:'ЛИЧНОСТЬ / ОТВЕТСТВЕННОСТЬ', subtitle:'КТО ОТВЕЧАЕТ ЗА ОБЪЕКТ'},
    {id:'audit-section', number:'08', name:'АУДИТ СМЕТЫ', subtitle:'ЕСЛИ СМЕТА УЖЕ ЕСТЬ'},
    {id:'contacts-section', number:'09', name:'КОНТАКТЫ', subtitle:'ПЕРВАЯ ВСТРЕЧА БЕЗ ЛИШНЕГО ШУМА'}
  ],
  calculator: {
    areaLimits: {flat:[20,120], house:[60,200], townhouse:[70,300], commercial:[10,100]},
    commercialHasRepairChoice:false,
    commercialRateMultiplier:2,
    resultFields:['Вид объекта','Площадь','Ориентировочный срок ремонта','Ориентировочная цена за м²'],
    afterComplete:['Заказать звонок','Новый расчёт']
  }
};

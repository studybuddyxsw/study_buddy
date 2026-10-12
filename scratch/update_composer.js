const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const courses = [
  {
    group: 'วิชาสอบปัจจุบัน (Final 2569)',
    items: [
      { val: '761311 การลงทุนทางธุรกิจ', label: '761311 การลงทุนทางธุรกิจ', selected: true },
      { val: '761361 CRM ลูกค้าสัมพันธ์', label: '761361 CRM ลูกค้าสัมพันธ์' },
      { val: '761314 การจัดการดำเนินงาน', label: '761314 การจัดการดำเนินงาน' },
      { val: '761312 โลจิสติกส์ยั่งยืน', label: '761312 โลจิสติกส์ยั่งยืน' },
      { val: '761313 สถิติสำหรับการวิจัย', label: '761313 สถิติสำหรับการวิจัย' }
    ]
  },
  {
    group: 'หมวดวิชาแกนธุรกิจ (Business Core)',
    items: [
      { val: '761101 หลักบัญชีเบื้องต้น', label: '761101 หลักบัญชีเบื้องต้น' },
      { val: '761111 การบัญชีการเงิน', label: '761111 การบัญชีการเงิน' },
      { val: '761102 เศรษฐศาสตร์เบื้องต้น', label: '761102 เศรษฐศาสตร์เบื้องต้น' },
      { val: '761112 เศรษฐศาสตร์ดิจิทัล', label: '761112 เศรษฐศาสตร์ดิจิทัล' },
      { val: '761201 องค์การและการจัดการ', label: '761201 องค์การและการจัดการ' },
      { val: '761202 การเงินธุรกิจ', label: '761202 การเงินธุรกิจ' },
      { val: '761203 หลักการตลาด', label: '761203 หลักการตลาด' },
      { val: '761204 การจัดการทรัพยากรมนุษย์', label: '761204 การจัดการทรัพยากรมนุษย์' },
      { val: '761205 กฎหมายธุรกิจและภาษีอากร', label: '761205 กฎหมายธุรกิจและภาษีอากร' },
      { val: '761206 ระบบสารสนเทศเพื่อการจัดการ', label: '761206 ระบบสารสนเทศเพื่อการจัดการ (MIS)' },
      { val: '761211 ภาษาอังกฤษเพื่อธุรกิจ', label: '761211 การพัฒนาทักษะภาษาอังกฤษเพื่อธุรกิจ' }
    ]
  },
  {
    group: 'หมวดวิชาเอกนวัตกรรมทางธุรกิจ (BIM Major)',
    items: [
      { val: '761219 ความคิดสร้างสรรค์และนวัตกรรม', label: '761219 ความคิดสร้างสรรค์และการจัดการนวัตกรรม' },
      { val: '761212 การเงินผู้ประกอบการและนวัตกรรม', label: '761212 การเงินผู้ประกอบการและนวัตกรรมทางการเงิน' },
      { val: '761321 นวัตกรรมการตลาดดิจิทัล', label: '761321 นวัตกรรมการตลาดดิจิทัล' },
      { val: '761322 การวางแผนการตลาด', label: '761322 การวางแผนและการดำเนินการทางการตลาด' },
      { val: '761323 เทคนิคการเล่าเรื่องธุรกิจ', label: '761323 เทคนิคการเล่าเรื่องเพื่อธุรกิจ' },
      { val: '761324 การจัดการความเสี่ยง', label: '761324 การจัดการความเสี่ยงทางธุรกิจและการประกันภัย' },
      { val: '761325 การพยากรณ์ทางธุรกิจ', label: '761325 การพยากรณ์ทางธุรกิจ' },
      { val: '761326 พฤติกรรมผู้บริโภคดิจิทัล', label: '761326 พฤติกรรมผู้บริโภคยุคดิจิทัล' },
      { val: '761327 การจัดการสตาร์ทอัพ', label: '761327 การจัดการสตาร์ทอัพและธุรกิจเกิดใหม่' },
      { val: '761401 การจัดการเชิงกลยุทธ์', label: '761401 การจัดการเชิงกลยุทธ์' },
      { val: '761491 สัมมนาประเด็นนวัตกรรม', label: '761491 สัมมนาประเด็นการจัดการนวัตกรรมทางธุรกิจ' },
      { val: '761492 โครงงานนวัตกรรมธุรกิจ', label: '761492 โครงงานนวัตกรรมทางธุรกิจ' }
    ]
  },
  {
    group: 'หมวดทั่วไป',
    items: [
      { val: 'ทบทวนทั่วไป', label: 'ทบทวนทั่วไป' },
      { val: 'ทำข้อสอบเก่า Final', label: 'ฝึกทำข้อสอบเก่า Final' }
    ]
  }
];

let popoverHtml = '';
let selectOptionsHtml = '';

courses.forEach(g => {
  popoverHtml += `                <div class="dropdown-group-label">${g.group}</div>\n`;
  g.items.forEach(it => {
    const isSel = it.selected ? ' selected' : '';
    const ariaSel = it.selected ? 'true' : 'false';
    popoverHtml += `                <div class="dropdown-opt-item${isSel}" role="option" aria-selected="${ariaSel}" data-value="${it.val}">
                  <span>${it.label}</span>
                  <i data-lucide="check" class="opt-check-icon"></i>
                </div>\n`;

    const selAttr = it.selected ? ' selected' : '';
    selectOptionsHtml += `                    <option value="${it.val}"${selAttr}>${it.label}</option>\n`;
  });
});

const formHtml = `          <!-- Add Checklist Task (Clean 2-tier composer) -->
          <form class="checklist-composer" id="form-add-checklist-task">
            <div class="composer-top-row">
              <div class="composer-category-selector">
                <span class="composer-field-label">
                  <i data-lucide="book-open" style="width: 15px; height: 15px;"></i>
                  <span>เลือกวิชาที่จะอ่าน:</span>
                </span>
                <div class="custom-dropdown" id="dropdown-task-category">
                  <button type="button" class="custom-dropdown-btn" id="btn-dropdown-category" aria-haspopup="listbox" aria-expanded="false" aria-label="เลือกหมวดหมู่วิชา">
                    <span id="label-selected-category">761311 การลงทุนทางธุรกิจ</span>
                    <i data-lucide="chevron-down" class="dropdown-chevron-icon"></i>
                  </button>
                  <div class="custom-dropdown-popover" role="listbox" id="popover-category-list">
${popoverHtml.trimEnd()}
                  </div>
                  <select id="select-task-category" style="position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;" tabindex="-1">
${selectOptionsHtml.trimEnd()}
                  </select>
                </div>
              </div>
            </div>

            <!-- Row 2: Note / Specific chapter & Action button -->
            <div class="composer-input-row">
              <div class="composer-input-box">
                <div class="checklist-input-prefix-icon" aria-hidden="true">
                  <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                </div>
                <input type="text" class="checklist-input" id="input-task-text" placeholder="พิมพ์หัวข้อ / หน้า / บทเรียน (หรือไม่พิมพ์ก็ได้)..." aria-label="พิมพ์หัวข้อหรือบทที่ต้องอ่านวันนี้">
              </div>
              <button type="submit" class="btn-add-item" aria-label="เพิ่มรายการอ่าน">
                <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                <span>เพิ่มรายการ</span>
              </button>
            </div>
          </form>`;

const startTag = '<!-- Add Checklist Task (Clean 2-tier composer) -->';
const endTag = '<!-- Task List Items -->';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Tags not found:', { startIndex, endIndex });
  process.exit(1);
}

const newContent = content.slice(0, startIndex) + formHtml + '\n\n          ' + content.slice(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESSFULLY REPLACED FORM');

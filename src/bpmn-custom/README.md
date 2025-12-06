# Custom BPMN Properties

## Tổng quan
File này chứa Custom Properties Provider để mở rộng BPMN Modeler với các thuộc tính tùy chỉnh.

## Các thuộc tính đã thêm

### 1. User Assignment (cho Task)
Khi chọn một **Task** (bất kỳ loại task nào), panel thuộc tính sẽ hiển thị thêm group "User Assignment" với:
- **Candidate Groups**: Dropdown select cho phép chọn role từ danh sách:
  - Manager
  - Developer
  - Tester
  - Admin
  - User

### 2. Condition (cho Sequence Flow)
Khi chọn một **Sequence Flow** (mũi tên kết nối giữa các elements), panel thuộc tính sẽ hiển thị thêm group "Condition" với:
- **Condition Type**: Dropdown select với 2 options:
  - Approve
  - Reject

## Cấu trúc file

```
src/
  bpmn-custom/
    provider/
      CustomPropertiesProvider.js  # Provider chính chứa logic
      index.js                      # Export module
```

## Cách hoạt động

1. **CustomPropertiesProvider** được đăng ký với `propertiesPanel` trong BpmnModeler
2. Khi user chọn một element, provider kiểm tra loại element:
   - Nếu là `bpmn:Task` → hiển thị User Assignment
   - Nếu là `bpmn:SequenceFlow` → hiển thị Condition
3. Giá trị được lưu trực tiếp vào `businessObject` của element
4. Khi export XML, các thuộc tính này sẽ được lưu trong BPMN file

## Tùy chỉnh

### Thêm role mới vào Candidate Groups
Mở file `CustomPropertiesProvider.js` và chỉnh sửa mảng `CANDIDATE_GROUPS`:

```javascript
const CANDIDATE_GROUPS = [
  { value: 'manager', label: 'Manager' },
  { value: 'developer', label: 'Developer' },
  // Thêm role mới ở đây
  { value: 'new_role', label: 'New Role' }
];
```

### Thêm condition type mới
Chỉnh sửa mảng `CONDITION_TYPES`:

```javascript
const CONDITION_TYPES = [
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
  // Thêm type mới ở đây
  { value: 'pending', label: 'Pending' }
];
```

### Thêm thuộc tính cho element type khác
Trong hàm `getGroups`, thêm điều kiện mới:

```javascript
getGroups(element) {
  return (groups) => {
    // Ví dụ: thêm cho Gateway
    if (is(element, 'bpmn:Gateway')) {
      groups.push(createCustomGroup(element, this._injector));
    }
    
    return groups;
  };
}
```

## Lưu ý kỹ thuật

- Provider sử dụng **LOW_PRIORITY (500)** để các thuộc tính custom xuất hiện sau các thuộc tính mặc định
- Sử dụng `modeling.updateProperties()` để cập nhật giá trị, đảm bảo tính năng undo/redo hoạt động đúng
- Các thuộc tính được lưu trực tiếp vào `businessObject`, không cần moddle extension riêng

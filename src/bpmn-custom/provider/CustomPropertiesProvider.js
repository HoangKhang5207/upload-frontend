import { is } from 'bpmn-js/lib/util/ModelUtil';

// Import các helper để tạo input fields
import {
    SelectEntry,
    isSelectEntryEdited
} from '@bpmn-io/properties-panel';

// Dữ liệu giả cho danh sách roles
const CANDIDATE_GROUPS = [
    { value: 'manager', label: 'Manager' },
    { value: 'developer', label: 'Developer' },
    { value: 'tester', label: 'Tester' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
];

// Dữ liệu cho Condition Type
const CONDITION_TYPES = [
    { value: 'approve', label: 'Approve' },
    { value: 'reject', label: 'Reject' }
];

// Low-priority provider để thêm các thuộc tính tùy chỉnh
const LOW_PRIORITY = 500;

export default class CustomPropertiesProvider {
    constructor(propertiesPanel, injector) {
        // Đăng ký provider với priority thấp để nó xuất hiện sau các thuộc tính mặc định
        propertiesPanel.registerProvider(LOW_PRIORITY, this);
        this._injector = injector;
    }

    // Hàm này quyết định các groups nào sẽ được hiển thị cho element được chọn
    getGroups(element) {
        return (groups) => {
            // Thêm User Assignment group cho Task
            if (is(element, 'bpmn:Task')) {
                groups.push(createUserAssignmentGroup(element, this._injector));
            }

            // Thêm Condition group cho Sequence Flow
            if (is(element, 'bpmn:SequenceFlow')) {
                groups.push(createConditionGroup(element, this._injector));
            }

            return groups;
        };
    }
}

CustomPropertiesProvider.$inject = ['propertiesPanel', 'injector'];

// Tạo group "User Assignment" cho Task
function createUserAssignmentGroup(element, injector) {
    const translate = injector.get('translate');

    return {
        id: 'userAssignment',
        label: translate('User Assignment'),
        entries: [
            {
                id: 'candidateGroups',
                element,
                component: CandidateGroups,
                isEdited: isSelectEntryEdited,
                injector
            }
        ]
    };
}

// Tạo group "Condition" cho Sequence Flow
function createConditionGroup(element, injector) {
    const translate = injector.get('translate');

    return {
        id: 'condition',
        label: translate('Condition'),
        entries: [
            {
                id: 'conditionType',
                element,
                component: ConditionType,
                isEdited: isSelectEntryEdited,
                injector
            }
        ]
    };
}

// Component cho Candidate Groups select
function CandidateGroups(props) {
    const { element, injector } = props;

    if (!injector) {
        console.error('Injector is undefined in CandidateGroups');
        return null;
    }

    const modeling = injector.get('modeling');
    const translate = injector.get('translate');
    const debounce = injector.get('debounceInput');

    const getValue = () => {
        return element.businessObject.candidateGroups || '';
    };

    const setValue = (value) => {
        modeling.updateProperties(element, {
            candidateGroups: value
        });
    };

    return SelectEntry({
        element,
        id: 'candidateGroups',
        label: translate('Candidate Groups'),
        getValue,
        setValue,
        getOptions: () => CANDIDATE_GROUPS,
        debounce
    });
}

// Component cho Condition Type select
function ConditionType(props) {
    const { element, injector } = props;

    if (!injector) {
        console.error('Injector is undefined in ConditionType');
        return null;
    }

    const modeling = injector.get('modeling');
    const translate = injector.get('translate');
    const debounce = injector.get('debounceInput');

    const getValue = () => {
        return element.businessObject.conditionType || '';
    };

    const setValue = (value) => {
        modeling.updateProperties(element, {
            conditionType: value
        });
    };

    return SelectEntry({
        element,
        id: 'conditionType',
        label: translate('Condition Type'),
        getValue,
        setValue,
        getOptions: () => CONDITION_TYPES,
        debounce
    });
}

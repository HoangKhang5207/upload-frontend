import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Checkbox, Button, Spin, message, Divider, Typography } from 'antd';
import { getDepartments, getDocumentCategories, assignDepartments, assignWorkflowElements, deployWorkflow } from '../../api/workflowApi';

const { TabPane } = Tabs;
const { Text } = Typography;

const ApplyWorkflowModal = ({ open, workflow, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [documentCategories, setDocumentCategories] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUrgency, setSelectedUrgency] = useState([]);
  const [selectedSecurity, setSelectedSecurity] = useState([]);
  
  // State for "Select All" functionality
  const [deptIndeterminate, setDeptIndeterminate] = useState(false);
  const [deptCheckAll, setDeptCheckAll] = useState(false);
  const [catIndeterminate, setCatIndeterminate] = useState(false);
  const [catCheckAll, setCatCheckAll] = useState(false);
  
  // Predefined urgency and security levels
  const urgencyLevels = ['Thường', 'Khẩn', 'Hỏa tốc'];
  const securityLevels = ['Thường', 'Mật', 'Tối mật'];

  useEffect(() => {
    if (open && workflow) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch departments
          const deptData = await getDepartments();
          setDepartments(deptData);
          
          // Fetch document categories
          const categoryData = await getDocumentCategories();
          setDocumentCategories(categoryData);
          
          // Set initial values from workflow
          setSelectedDepartments(workflow.departmentIds || []);
          setSelectedCategories(workflow.workflowEleDto?.categoryIds || []);
          setSelectedUrgency(workflow.workflowEleDto?.urgency || []);
          setSelectedSecurity(workflow.workflowEleDto?.security || []);
          
          // Update "Select All" states
          setDeptIndeterminate(workflow.departmentIds?.length > 0 && workflow.departmentIds?.length < deptData.length);
          setDeptCheckAll(deptData.length > 0 && workflow.departmentIds?.length === deptData.length);
          setCatIndeterminate(workflow.workflowEleDto?.categoryIds?.length > 0 && workflow.workflowEleDto?.categoryIds?.length < categoryData.length);
          setCatCheckAll(categoryData.length > 0 && workflow.workflowEleDto?.categoryIds?.length === categoryData.length);
        } catch (error) {
          console.error('Error fetching data:', error);
          message.error('Không thể tải dữ liệu!');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      // Reset state when modal is closed
      setSelectedDepartments([]);
      setSelectedCategories([]);
      setSelectedUrgency([]);
      setSelectedSecurity([]);
      setDeptIndeterminate(false);
      setDeptCheckAll(false);
      setCatIndeterminate(false);
      setCatCheckAll(false);
    }
  }, [open, workflow]);

  // Department selection handlers
  const onDepartmentChange = (deptId, checked) => {
    const newSelectedDepts = checked
      ? [...selectedDepartments, deptId]
      : selectedDepartments.filter(id => id !== deptId);
    
    setSelectedDepartments(newSelectedDepts);
    setDeptIndeterminate(newSelectedDepts.length > 0 && newSelectedDepts.length < departments.length);
    setDeptCheckAll(newSelectedDepts.length === departments.length);
  };

  const onDeptCheckAllChange = (e) => {
    const allDeptIds = e.target.checked ? departments.map(d => d.id) : [];
    setSelectedDepartments(allDeptIds);
    setDeptIndeterminate(false);
    setDeptCheckAll(e.target.checked);
  };

  // Category selection handlers
  const onCategoryChange = (catId, checked) => {
    const newSelectedCats = checked
      ? [...selectedCategories, catId]
      : selectedCategories.filter(id => id !== catId);
    
    setSelectedCategories(newSelectedCats);
    setCatIndeterminate(newSelectedCats.length > 0 && newSelectedCats.length < documentCategories.length);
    setCatCheckAll(newSelectedCats.length === documentCategories.length);
  };

  const onCatCheckAllChange = (e) => {
    const allCatIds = e.target.checked ? documentCategories.map(c => c.id) : [];
    setSelectedCategories(allCatIds);
    setCatIndeterminate(false);
    setCatCheckAll(e.target.checked);
  };

  // Urgency selection handlers
  const onUrgencyChange = (level, checked) => {
    const newSelected = checked
      ? [...selectedUrgency, level]
      : selectedUrgency.filter(item => item !== level);
    
    setSelectedUrgency(newSelected);
  };

  // Security selection handlers
  const onSecurityChange = (level, checked) => {
    const newSelected = checked
      ? [...selectedSecurity, level]
      : selectedSecurity.filter(item => item !== level);
    
    setSelectedSecurity(newSelected);
  };

  const handleSave = async () => {
    if (!workflow) return;
    
    setSaving(true);
    try {
      // Apply departments
      await assignDepartments(workflow.id, selectedDepartments);
      
      // Apply workflow elements (categories, urgency, security)
      await assignWorkflowElements(workflow.id, {
        categoryIds: selectedCategories,
        urgency: selectedUrgency,
        security: selectedSecurity
      });
      
      message.success('Áp dụng workflow thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error applying workflow:', error);
      message.error('Áp dụng workflow thất bại: ' + (error.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!workflow) return;
    
    // Check if departments and categories are selected
    if (selectedDepartments.length === 0) {
      message.warning('Vui lòng chọn ít nhất một phòng ban trước khi triển khai!');
      return;
    }
    
    setSaving(true);
    try {
      // Apply departments and elements first
      await assignDepartments(workflow.id, selectedDepartments);
      await assignWorkflowElements(workflow.id, {
        categoryIds: selectedCategories,
        urgency: selectedUrgency,
        security: selectedSecurity
      });
      
      // Deploy the workflow
      await deployWorkflow(workflow.id);
      
      message.success('Triển khai workflow thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deploying workflow:', error);
      message.error('Triển khai workflow thất bại: ' + (error.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Áp dụng Workflow: ${workflow?.name}`}
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="back" onClick={onClose}>Hủy</Button>,
        <Button key="save" type="primary" loading={saving} onClick={handleSave}>
          Áp dụng
        </Button>,
        <Button key="deploy" type="primary" loading={saving} onClick={handleDeploy}>
          Áp dụng và Triển khai
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <div style={{ padding: '16px 0' }}>
          <Text strong>{workflow?.description}</Text>
        </div>
        
        <Tabs defaultActiveKey="1">
          <TabPane tab="Phòng ban" key="1">
            <div style={{ marginBottom: 16 }}>
              <Checkbox
                indeterminate={deptIndeterminate}
                onChange={onDeptCheckAllChange}
                checked={deptCheckAll}
              >
                Chọn tất cả phòng ban
              </Checkbox>
            </div>
            
            <div style={{ 
              maxHeight: 300, 
              overflowY: 'auto', 
              border: '1px solid #f0f0f0', 
              borderRadius: 4,
              padding: 8
            }}>
              {departments.map(dept => (
                <div key={dept.id} style={{ padding: '8px 0' }}>
                  <Checkbox
                    value={dept.id}
                    checked={selectedDepartments.includes(dept.id)}
                    onChange={(e) => onDepartmentChange(dept.id, e.target.checked)}
                  >
                    {dept.name}
                  </Checkbox>
                </div>
              ))}
            </div>
          </TabPane>
          
          <TabPane tab="Loại văn bản" key="2">
            <div style={{ marginBottom: 16 }}>
              <Checkbox
                indeterminate={catIndeterminate}
                onChange={onCatCheckAllChange}
                checked={catCheckAll}
              >
                Chọn tất cả loại văn bản
              </Checkbox>
            </div>
            
            <div style={{ 
              maxHeight: 300, 
              overflowY: 'auto', 
              border: '1px solid #f0f0f0', 
              borderRadius: 4,
              padding: 8
            }}>
              {documentCategories.map(cat => (
                <div key={cat.id} style={{ padding: '8px 0' }}>
                  <Checkbox
                    value={cat.id}
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => onCategoryChange(cat.id, e.target.checked)}
                  >
                    {cat.name}
                  </Checkbox>
                </div>
              ))}
            </div>
          </TabPane>
          
          <TabPane tab="Độ khẩn & Độ mật" key="3">
            <div>
              <Text strong>Độ khẩn:</Text>
              <div style={{ margin: '8px 0' }}>
                {urgencyLevels.map(level => (
                  <div key={level} style={{ padding: '4px 0' }}>
                    <Checkbox
                      value={level}
                      checked={selectedUrgency.includes(level)}
                      onChange={(e) => onUrgencyChange(level, e.target.checked)}
                    >
                      {level}
                    </Checkbox>
                  </div>
                ))}
              </div>
            </div>
            
            <Divider />
            
            <div>
              <Text strong>Độ mật:</Text>
              <div style={{ margin: '8px 0' }}>
                {securityLevels.map(level => (
                  <div key={level} style={{ padding: '4px 0' }}>
                    <Checkbox
                      value={level}
                      checked={selectedSecurity.includes(level)}
                      onChange={(e) => onSecurityChange(level, e.target.checked)}
                    >
                      {level}
                    </Checkbox>
                  </div>
                ))}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default ApplyWorkflowModal;
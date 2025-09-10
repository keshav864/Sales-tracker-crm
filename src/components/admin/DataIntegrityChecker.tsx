import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, Wrench } from 'lucide-react';
import { User, SalesRecord, AttendanceRecord } from '../../types';
import { validateAllData, fixDataIssues, DataValidationResult } from '../../utils/dataIntegrity';

interface DataIntegrityCheckerProps {
  users: User[];
  sales: SalesRecord[];
  attendance: AttendanceRecord[];
  onDataFixed: (users: User[], sales: SalesRecord[], attendance: AttendanceRecord[]) => void;
}

export const DataIntegrityChecker: React.FC<DataIntegrityCheckerProps> = ({
  users,
  sales,
  attendance,
  onDataFixed,
}) => {
  const [validationResult, setValidationResult] = useState<DataValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const runValidation = async () => {
    setIsChecking(true);
    
    // Simulate async validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = validateAllData(users, sales, attendance);
    setValidationResult(result);
    setIsChecking(false);
  };

  const fixIssues = async () => {
    setIsFixing(true);
    
    // Simulate async fixing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { users: fixedUsers, sales: fixedSales, attendance: fixedAttendance, fixesApplied } = 
      fixDataIssues(users, sales, attendance);
    
    onDataFixed(fixedUsers, fixedSales, fixedAttendance);
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
    successDiv.innerHTML = `✅ Applied ${fixesApplied.length} fixes successfully!`;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
    
    // Re-run validation
    const newResult = validateAllData(fixedUsers, fixedSales, fixedAttendance);
    setValidationResult(newResult);
    setIsFixing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Data Integrity Checker</h3>
        </div>
        <button
          onClick={runValidation}
          disabled={isChecking}
          className="btn-primary flex items-center space-x-2"
        >
          {isChecking ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          <span>Run Validation</span>
        </button>
      </div>

      {!validationResult && !isChecking && (
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Data Integrity Check</h4>
          <p className="text-gray-600 mb-6">
            Run a comprehensive validation to check for data consistency issues, 
            duplicate records, and referential integrity problems.
          </p>
          <button
            onClick={runValidation}
            className="btn-primary"
          >
            Start Validation
          </button>
        </div>
      )}

      {isChecking && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Validating Data...</h4>
          <p className="text-gray-600">
            Checking {users.length} users, {sales.length} sales records, and {attendance.length} attendance records.
          </p>
        </div>
      )}

      {validationResult && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`card ${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-3">
              {validationResult.isValid ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <h4 className={`text-lg font-semibold ${validationResult.isValid ? 'text-green-900' : 'text-red-900'}`}>
                  {validationResult.isValid ? 'Data Integrity: PASSED' : 'Data Integrity: FAILED'}
                </h4>
                <p className={`text-sm ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {validationResult.isValid 
                    ? 'All data validation checks passed successfully.'
                    : `Found ${validationResult.errors.length} errors and ${validationResult.warnings.length} warnings.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-start space-x-3">
                <XCircle className="w-6 h-6 text-red-600 mt-1" />
                <div className="flex-1">
                  <h5 className="font-semibold text-red-900 mb-2">
                    Errors ({validationResult.errors.length})
                  </h5>
                  <ul className="space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <h5 className="font-semibold text-yellow-900 mb-2">
                    Warnings ({validationResult.warnings.length})
                  </h5>
                  <ul className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Fix Issues Button */}
          {!validationResult.isValid && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wrench className="w-6 h-6 text-blue-600" />
                  <div>
                    <h5 className="font-semibold text-blue-900">Auto-Fix Available</h5>
                    <p className="text-sm text-blue-700">
                      Some issues can be automatically resolved. This will fix data format issues,
                      remove invalid references, and recalculate totals.
                    </p>
                  </div>
                </div>
                <button
                  onClick={fixIssues}
                  disabled={isFixing}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isFixing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Wrench className="w-5 h-5" />
                  )}
                  <span>Fix Issues</span>
                </button>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <h6 className="text-sm font-medium text-gray-500 mb-1">Users</h6>
              <p className="text-2xl font-bold text-blue-600">{users.length}</p>
            </div>
            <div className="card text-center">
              <h6 className="text-sm font-medium text-gray-500 mb-1">Sales Records</h6>
              <p className="text-2xl font-bold text-green-600">{sales.length}</p>
            </div>
            <div className="card text-center">
              <h6 className="text-sm font-medium text-gray-500 mb-1">Attendance Records</h6>
              <p className="text-2xl font-bold text-purple-600">{attendance.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
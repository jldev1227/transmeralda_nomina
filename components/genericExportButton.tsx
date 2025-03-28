"use client";

import React, { useState } from 'react';
import { Button } from '@nextui-org/button';
import { Download, Loader } from 'lucide-react';
import { useNomina } from '@/context/NominaContext';

interface GenericExportButtonProps {
    getData: () => Promise<any>;
    label?: string;
    options?: any;
    buttonClassName?: string;
    buttonProps?: any;
}

const GenericExportButton = ({ 
  getData,
  label = "Exportar a Excel", 
  options = {},
  buttonClassName = "bg-emerald-600 text-white",
  buttonProps = {}
} : GenericExportButtonProps) => {
  const { exportExcel } = useNomina();
  const [isLoading, _setIsLoading] = useState(false);
  const [error, _setError] = useState(null);

  const handleExport = async () => {
    await exportExcel(options, getData)
  };

  return (
    <div>
      <Button
        color="primary"
        variant="flat"
        startContent={isLoading ? <Loader className="animate-spin" size={16} /> : <Download size={16} />}
        onPress={handleExport}
        disabled={isLoading}
        className={buttonClassName}
        {...buttonProps}
      >
        {isLoading ? 'Exportando...' : label}
      </Button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default GenericExportButton;
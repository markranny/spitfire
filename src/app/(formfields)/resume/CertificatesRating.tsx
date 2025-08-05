"use client";
import React, { useEffect, useRef } from "react";
import { Form } from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { certificatesSchema, CertificatesFormData } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { updateWizardStep } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/state/redux";
import { setFormData } from "@/state";
import { Plus, Trash2 } from "lucide-react";
import useResume from "@/hooks/useResume";

const CertificatesRating = () => {
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const hasInitialized = useRef(false);
  const { saveResumeData, resumeSaving, resumeSavingError } = useResume();
  const defaultRating = {
    rating: "",
    privilege_type: "",
  };
  const defaultCertificate = {
    certificate: "",
  };
  const defaultCertData = {
    airline_transport_pilot: "",
    flight_instructor: "",
    remote_pilot: "",
    medical: "",
    certificates: [defaultCertificate, defaultCertificate, defaultCertificate],
    pic_sic_ratings: [defaultRating, defaultRating, defaultRating],
  };

  const methods = useForm<CertificatesFormData>({
    resolver: zodResolver(certificatesSchema),
    defaultValues: formData?.[navigationStep]?.data || defaultCertData,
  });

  const { control, watch, setValue } = methods;

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
  } = useFieldArray({
    control: methods.control,
    name: "certificates",
  });

  const {
    fields: ratingFields,
    append: appendRating,
    remove: removeRating,
  } = useFieldArray({
    control: methods.control,
    name: "pic_sic_ratings",
  });

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      const { data } = formData[navigationStep];
      methods.reset(data);
    } else if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (certificateFields.length === 0) {
        appendCertificate([...defaultCertData.certificates]);
      }
      if (ratingFields.length === 0) {
        appendRating([...defaultCertData.pic_sic_ratings]);
      }
    }
  }, [methods, formData, navigationStep, appendCertificate, appendRating]);

  const handleAddCertificate = () => {
    const newCertificate = { ...defaultCertificate };
    appendCertificate(newCertificate);
  };

  const handleAddRating = () => {
    const newRating = { ...defaultRating };
    appendRating(newRating);
  };

  const handlePrivilegeChange = (index: number, type: "PIC" | "SIC" | "") => {
    const currentValue = watch(`pic_sic_ratings.${index}.privilege_type`);
    setValue(`pic_sic_ratings.${index}.privilege_type`, currentValue === type ? "" : type);
  };

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Certificates And Ratings</h1>
      <p className="text-customgreys-dirtyGrey text-md pt-5">Please fill out all question fields below</p>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit((data: any) => {
            let modifiedData = data;
            if (JSON.stringify(modifiedData) === JSON.stringify(defaultCertData)) {
              modifiedData = null;
            }
            const savedData = updateWizardStep("formData", navigationStep, modifiedData, true);
            saveResumeData(savedData);
            dispatch(setFormData(savedData));
            navigateToStep(navigationStep + 1);
          })}
          className="checkout-details__form flex flex-col gap-5 w-2/3"
        >
          <div className="flex flex-col gap-1 w-full pt-5">
            <div className="flex gap-4 items-center">
              <CustomFormField
                name="airline_transport_pilot"
                label="Airline Transport Pilot"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Certificate Name"
              />
              <CustomFormField
                name="flight_instructor"
                label="Flight Instructor"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Certificate Name"
              />
              <CustomFormField
                name="remote_pilot"
                label="Remote Pilot"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Certificate Name"
              />
              <CustomFormField
                name="medical"
                label="Medical"
                type="text"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Certificate Name"
              />
            </div>
            <span className="text-black pt-10">What Certificates do you hold?</span>
            {certificateFields.length > 0 &&
              certificateFields.map((item, index) => (
                <div className="group relative flex gap-4 items-center" key={item.id}>
                  <CustomFormField
                    name={`certificates.${index}.certificate`}
                    placeholder={`Certificate ${index + 1}`}
                    type="text"
                    label=""
                    className="w-full rounded mt-4"
                    labelClassName="font-normal text-black"
                    inputClassName="py-3 text-black rounded-none p-2"
                  />
                  <Button
                    type="button"
                    onClick={() => removeCertificate(index)}
                    className="absolute right-[-20px] top-4/5 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
          </div>
          <Button
            type="button"
            disabled={certificateFields.length >= 6}
            onClick={handleAddCertificate}
            className="w-fit flex gap-2 justify-between min-w-32 px-3 my-6 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold"
          >
            <Plus className="text-orange-500" />
            Add Certificates
          </Button>

          <span className="text-black">List your type ratings and specify their privilege type.</span>
          <div className="flex flex-col gap-2 w-full">
            {ratingFields.length > 0 &&
              ratingFields.map((item, index) => {
                const privilegeType = watch(`pic_sic_ratings.${index}.privilege_type`);
                return (
                  <div className="group relative flex gap-4 items-center" key={item.id}>
                    <CustomFormField
                      name={`pic_sic_ratings.${index}.rating`}
                      placeholder={`Rating ${index + 1}`}
                      label=""
                      type="text"
                      className="w-full rounded mt-4"
                      labelClassName="font-normal text-black"
                      inputClassName="py-3 text-black rounded-none p-2"
                    />
                    <div className="flex gap-4 mt-4">
                      <CustomFormField
                        className="py-3 text-black rounded-none p-2"
                        labelClassName="font-normal text-black"
                        name={`pic_sic_ratings.${index}.privilege_type`}
                        label="PIC"
                        type="checkbox"
                        checked={privilegeType === "PIC"}
                        onChange={() => handlePrivilegeChange(index, "PIC")}
                      />
                      <CustomFormField
                        className="py-3 text-black rounded-none p-2"
                        labelClassName="font-normal text-black"
                        name={`pic_sic_ratings.${index}.privilege_type`}
                        label="SIC"
                        type="checkbox"
                        checked={privilegeType === "SIC"}
                        onChange={() => handlePrivilegeChange(index, "SIC")}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeRating(index)}
                      className="absolute right-[-20px] top-4/5 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                );
              })}
          </div>
          <Button
            type="button"
            disabled={ratingFields.length >= 6}
            onClick={handleAddRating}
            className="w-fit flex gap-2 justify-between min-w-32 px-3 my-6 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold"
          >
            <Plus className="text-orange-500" />
            Add Ratings
          </Button>

          <div className="pt-10 w-full flex justify-between">
            <Button
              type="button"
              onClick={() => navigateToStep(navigationStep - 1)}
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
            >
              Previous
            </Button>
            <Button
              type="submit"
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
            >
              Continue to Flight Experiences
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CertificatesRating;

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PropertyProject } from "@/lib/supabase/supabaseUtils";
import {
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  PhotoIcon,
  EnvelopeIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProjectCardProps {
  project: PropertyProject;
  onDelete: (id: string) => void;
  deleteInProgress?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  deleteInProgress = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full bg-slate-200">
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={project.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                const div = document.createElement("div");
                div.className =
                  "flex items-center justify-center h-full w-full";
                div.innerHTML = `<div class="text-slate-500 flex flex-col items-center">
                  <svg class="h-12 w-12 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span class="text-sm">${project.name}</span>
                </div>`;
                parent.appendChild(div);
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-slate-500 flex flex-col items-center">
              <HomeIcon className="h-12 w-12 mb-2" />
              <span className="text-sm">{project.name}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {project.name}
        </h3>
        <p className="text-gray-600 mb-2 truncate">{project.address}</p>
        <div className="flex items-center text-gray-500 mb-3">
          <span className="mr-3">{project.bedrooms} beds</span>
          <span className="mr-3">{project.bathrooms} baths</span>
          <span>{project.square_feet} sqft</span>
        </div>
        <p className="text-blue-600 font-semibold mb-4">
          ${project.listing_price}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md text-sm hover:bg-gray-100"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            View Project
          </Link>

          <Link
            href={`/property-listing?projectId=${project.id}`}
            className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            Listing
          </Link>

          <Link
            href={`/social-media?projectId=${project.id}`}
            className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md text-sm hover:bg-purple-100"
          >
            <PhotoIcon className="w-4 h-4 mr-1" />
            Social
          </Link>

          <Link
            href={`/email-campaign?projectId=${project.id}`}
            className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-md text-sm hover:bg-green-100"
          >
            <EnvelopeIcon className="w-4 h-4 mr-1" />
            Email
          </Link>
        </div>

        <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
          <Link
            href={`/projects/edit/${project.id}`}
            className="flex items-center text-gray-500 hover:text-blue-600"
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Edit
          </Link>

          <button
            onClick={() => onDelete(project.id)}
            className="flex items-center text-gray-500 hover:text-red-600"
            disabled={deleteInProgress}
          >
            {deleteInProgress ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-1 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
